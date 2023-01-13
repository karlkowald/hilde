import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "~/utils/trpc";
import { z } from "zod";
import { toast } from "react-toastify";
import { Card, LoadingIndicator } from "~/components/Elements";
import { Input } from "~/components/Form";

interface FormValues {
  team1: string;
  team2: string;
  score1: number | string;
  score2: number | string;
  comment: string;
}

export const MatchCreationForm = () => {
  const {
    handleSubmit,
    reset,
    register,
    formState: { isValid },
    setFocus,
  } = useForm<FormValues>({
    defaultValues: {
      team1: "",
      team2: "",
      score1: "",
      score2: "",
      comment: "",
    },
    resolver: zodResolver(
      z.object({
        team1: z.string().min(2),
        team2: z.string().min(2),
        score1: z.preprocess(
          v => (v !== "" ? Number(v) : undefined),
          z.number().min(0),
        ),
        score2: z.preprocess(
          v => (v !== "" ? Number(v) : undefined),
          z.number().min(0),
        ),
        comment: z.string().optional(),
      }),
    ),
    mode: "all",
  });

  const utils = trpc.useContext();
  const mutation = trpc.matches.add.useMutation({
    onSuccess: async () => {
      await utils.matches.invalidate();
      toast("Match saved.", {
        type: "success",
      });
      setFocus("team1");
      reset();
    },
    onError: () => {
      toast("Failed to save match.", {
        type: "error",
      });
    },
  });

  return (
    <form
      onSubmit={handleSubmit(values =>
        mutation.mutate({
          ...values,
          score1: +values.score1,
          score2: +values.score2,
        }),
      )}
    >
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-12">
            <div className="col-span-5">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8">
                  <Input
                    placeholder="gp,rm,..."
                    label="Team 1"
                    {...register("team1")}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    type="number"
                    placeholder="2"
                    label="Score"
                    {...register("score1")}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-2 text-center self-center">
              <h3 className="font-bold text-3xl">vs</h3>
            </div>
            <div className="col-span-5">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-8">
                  <Input
                    placeholder="pt,dl,..."
                    label="Team 2"
                    {...register("team2")}
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    type="number"
                    placeholder="3"
                    label="Score"
                    {...register("score2")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-3 flex justify-between border-t dark:border-gray-500">
          <input
            type="text"
            className="border-0 text-sm focus:outline-none bg-transparent"
            placeholder="Comment"
            {...register("comment")}
          />
          <button
            type="submit"
            className="px-6 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isValid}
          >
            {mutation.isLoading ? <LoadingIndicator /> : "Save"}
          </button>
        </div>
      </Card>
    </form>
  );
};

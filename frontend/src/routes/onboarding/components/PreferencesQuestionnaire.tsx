import { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent } from "@shadcn-ui/components/ui/card";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@shadcn-ui/components/ui/questionnaire";
import { useCreatePreferences } from "../../../api/preferences/createPreferences/useCreatePreferences";
import { ApiError } from "../../../api/errors";
import { queryKeys } from "../../../api/queryKeys";
import * as userPreferenceSchema from "../../../types/userPreference";

/**
 * One entry per preference. The `name` must match the field in
 * `UserPreferenceSchema`, since the answers are parsed with it on submit.
 */
const items = [
  {
    name: "weightUnit",
    required: true,
    prompt: "Which unit do you lift in?",
    description:
      "Used as the default for new sets. You can change it later in your settings.",
    choices: [
      { value: "kg", label: "Kilograms", description: "kg" },
      { value: "lb", label: "Pounds", description: "lb" },
    ],
  },
] as const;

const AnswersSchema = userPreferenceSchema.UserPreferenceSchema.pick({
  weightUnit: true,
});

export const PreferencesQuestionnaire = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: createPreferences, isPending } = useCreatePreferences();

  const finish = () => {
    void navigate("/", { replace: true });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const answers = new FormData(event.currentTarget);
    const parsed = AnswersSchema.safeParse({
      weightUnit: answers.get("weightUnit"),
    });

    // The questionnaire enforces `required` before Submit is reachable, so
    // this only guards against a stale or tampered form.
    if (!parsed.success) {
      toast.error("Please pick a unit", { position: "bottom-right" });
      return;
    }

    createPreferences(parsed.data, {
      onSuccess: () => {
        toast.success("You're all set", { position: "bottom-right" });
        finish();
      },
      onError: (error) => {
        console.error(error);

        // Preferences appeared in the meantime (another tab, a retry):
        // the goal is reached either way, so continue into the app.
        if (error instanceof ApiError && error.status === 409) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.preferences.detail,
          });
          finish();
          return;
        }

        const message =
          error instanceof ApiError
            ? error.message
            : "Could not save your settings";
        toast.error(message, { position: "bottom-right" });
      },
    });
  };

  return (
    <Card>
      <CardContent>
        <Questionnaire items={items} onSubmit={handleSubmit}>
          <QuestionnaireProgress />
          {items.map((question) => (
            <QuestionnaireItem
              key={question.name}
              name={question.name}
              required={question.required}
            >
              <QuestionnaireTitle>{question.prompt}</QuestionnaireTitle>
              <QuestionnaireDescription>
                {question.description}
              </QuestionnaireDescription>
              <QuestionnaireChoices>
                {question.choices.map((choice) => (
                  <QuestionnaireChoice
                    key={choice.value}
                    value={choice.value}
                    disabled={isPending}
                  >
                    <span className="font-medium">{choice.label}</span>
                    <QuestionnaireChoiceDescription>
                      {choice.description}
                    </QuestionnaireChoiceDescription>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError />
            </QuestionnaireItem>
          ))}
          <QuestionnaireActions>
            <QuestionnairePrevious disabled={isPending} />
            <QuestionnaireNext disabled={isPending} />
            <QuestionnaireSubmit disabled={isPending}>
              {isPending ? "Saving..." : "Finish"}
            </QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      </CardContent>
    </Card>
  );
};

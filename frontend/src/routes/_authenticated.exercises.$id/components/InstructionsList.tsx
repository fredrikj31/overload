type InstructionsListProps = {
  instructions: string[];
};

export const InstructionsList = ({ instructions }: InstructionsListProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-sm font-medium text-muted-foreground">
        Instructions
      </h2>
      {instructions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No instructions available.
        </p>
      ) : (
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
};

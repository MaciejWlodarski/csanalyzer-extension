import Panel from "./Panel";

const TopbarTrigger = () => {
  return (
    <div className="flex h-full gap-2">
      <span className="mx-8 w-px bg-neutral-800"></span>
      <div className="flex h-full justify-center">
        <Panel />
      </div>
    </div>
  );
};

export default TopbarTrigger;

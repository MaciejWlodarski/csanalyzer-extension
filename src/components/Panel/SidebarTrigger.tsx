import Panel from "./Panel";

const SidebarTrigger = () => {
  return (
    <div className="flex w-full flex-col gap-2 pb-1">
      <span className="m-4 mt-1 h-px bg-neutral-800"></span>
      <div className="flex w-full justify-center">
        <Panel />
      </div>
    </div>
  );
};

export default SidebarTrigger;

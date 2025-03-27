export const AnimateUnderline = ({ show = false }: { show?: boolean }) => {
  return (
    <span
      style={{
        transform: show ? "scaleX(1)" : "scaleX(0)",
      }}
      className="absolute -bottom-2 -left-2 -right-2 h-1 origin-left scale-x-0 rounded-full bg-blue-300 transition-transform duration-300 ease-out"
    />
  );
};

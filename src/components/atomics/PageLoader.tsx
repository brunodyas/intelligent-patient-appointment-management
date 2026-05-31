const PageLoader = () => {
  return (
    <div className="fixed inset-0 flex z-[1000] items-center justify-center bg-[#b8b0b4] bg-opacity-50">
      <div className="animate-spin h-12 w-12 border-t-4 border-[#c63d7f] rounded-full" />
    </div>
  );
};

export default PageLoader;

interface LoadingContainerProps {
  size?: 'full' | 'default';
}

export const LoadingContainer = ({size = 'default'}: LoadingContainerProps) => {
    const sizeClass = size === 'full' ? 'w-screen h-screen' : 'h-[50vh]';

    return (
      <div className={`${sizeClass} flex justify-center items-center flex-col`}>
        <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  };
  

export const EmptyState = (props: {title: string, message: string}) => {
  return (
    <div
      className="bg-white-100 h-max w-full md:w-[650px] md:mx-28 mx-auto border-t-4 border-white-500 rounded-b text-gray-900 px-4 py-3 shadow-md"
      role="alert"
    >
      <div className="flex justify-center gap-3 md:gap-4">
        <div className="py-1">
          <svg
            className="fill-current h-5 w-5 md:h-6 md:w-6 text-white-500 mr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm">
            {props.message} {props.title}
          </p>
          <span>
            <a href="/categories"
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              explore categories
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}

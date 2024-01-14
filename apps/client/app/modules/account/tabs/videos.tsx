export const ProfileVideos = () => {
  return (
    <div className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-24 text-center ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="mx-auto h-16 w-16 text-gray-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>

      <span className="mt-2 block text-sm font-semibold text-gray-500">
        Coming soon...
      </span>
    </div>
  )
}

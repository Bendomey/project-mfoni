import {classNames} from '@/lib/classNames.ts'
import {Link} from '@remix-run/react'

const teams = [
  {
    id: 1,
    name: 'Your purchases',
    href: '/account/your-purchases',
    initial: 'P',
    current: false,
  },
  {id: 2, name: 'Your Saved Cards', href: '#', initial: 'C', current: false},
]

export function QuickActions() {
  return (
    <div>
      <div className="text-xs font-semibold leading-6 text-gray-400">
        Quick Actions
      </div>
      <ul className="-mx-2 mt-2 space-y-1">
        {teams.map(team => (
          <li key={team.name}>
            <Link
              to={team.href}
              className={classNames(
                team.current
                  ? 'bg-gray-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600',
                'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
              )}
            >
              <span
                className={classNames(
                  team.current
                    ? 'border-blue-600 text-blue-600'
                    : 'border-gray-200 text-gray-400 group-hover:border-blue-600 group-hover:text-blue-600',
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium',
                )}
              >
                {team.initial}
              </span>
              <span className="truncate">{team.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

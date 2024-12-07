import {Image} from 'remix-image'

const people = [
  {
    name: 'Leonard Krasner',
    role: 'Creator',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    xUrl: '#',
    linkedinUrl: '#',
  },
  {
    name: 'Leonard Krasner',
    role: 'Creator',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    xUrl: '#',
    linkedinUrl: '#',
  },
  {
    name: 'Leonard Krasner',
    role: 'Creator',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
    xUrl: '#',
    linkedinUrl: '#',
  },
  // More people...
]

export function OtherCreators() {
  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        Creators you may like.
      </h3>
      <ul className="grid grid-cols-1 gap-2 mt-3">
        {people.map(person => (
          <li key={person.name} className="rounded-md border p-4 bg-white">
            <div className="flex items-center gap-2 ">
              <Image
                alt=""
                src={person.imageUrl}
                className="h-20 w-20 rounded-md"
              />
              <div>
                <h3 className="text-base font-semibold leading-7 tracking-tight">
                  {person.name}
                </h3>
                <span className="text-sm leading-6 text-gray-400">
                  {person.role}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

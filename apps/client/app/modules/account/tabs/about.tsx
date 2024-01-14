import {classNames} from '@/lib/classNames.ts'
import {Link} from '@remix-run/react'
import {
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  MailIcon,
} from '@/components/SocialIcons.tsx'

const SocialLink = ({
  className,
  href,
  children,
  icon: Icon,
}: {
  className?: string
  href: string
  icon: React.ComponentType<{className?: string}>
  children: React.ReactNode
}) => {
  return (
    <li className={classNames(className, 'flex')}>
      <Link
        to={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-blue-500 "
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-blue-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

export const ProfileAbout = () => {
  return (
    <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
      {/* <div className="lg:pl-20">
        <div className="max-w-xs px-2.5 lg:max-w-none">
          <img
            src={profile.imageUrl}
            alt=""
            className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover "
            sizes="(min-width: 1024px) 32rem, 20rem"
          />
        </div>
      </div> */}
      <div className="lg:order-first lg:row-span-2">
        {/* <h1 className="text-4xl font-bold  text-zinc-800 sm:text-5xl">
          I’m Ron. I live in Accra where I design the future.
        </h1> */}
        <div className="mt-6 space-y-7 text-base text-zinc-600 mr-0 lg:mr-12 ">
          <p>
            I’ve loved making things for as long as I can remember, and wrote my
            first program when I was 6 years old, just two weeks after my mom
            brought home the brand new Macintosh LC 550 that I taught myself to
            type on.
          </p>
          <p>
            The only thing I loved more than computers as a kid was space. When
            I was 8, I climbed the 40-foot oak tree at the back of our yard
            while wearing my older sister’s motorcycle helmet, counted down from
            three, and jumped — hoping the tree was tall enough that with just a
            bit of momentum I’d be able to get to orbit.
          </p>
        </div>
      </div>
      <div className="lg:mt-8 mt-0 ">
        <ul>
          <SocialLink href="#" icon={TwitterIcon}>
            Follow on Twitter
          </SocialLink>
          <SocialLink href="#" icon={InstagramIcon} className="mt-4">
            Follow on Instagram
          </SocialLink>

          <SocialLink href="#" icon={LinkedInIcon} className="mt-4">
            Follow on LinkedIn
          </SocialLink>
          <SocialLink
            href="mailto:ron@mylespudo.com"
            icon={MailIcon}
            className="mt-8 border-t border-zinc-100 pt-8 "
          >
            ron@mylespudo.com
          </SocialLink>
        </ul>
      </div>
    </div>
  )
}

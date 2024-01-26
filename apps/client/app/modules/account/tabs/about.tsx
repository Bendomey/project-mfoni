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
    <div className="sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
      <div className="min-w-0 flex-1 block">
        <div className="space-y-7 text-base text-zinc-600 ">
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
      <div className="mt-8 sm:mt-12  flex flex-col justify-center space-y-3 sm:flex-col sm:space-y-4 ">
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

import {AnimatedTooltip} from '@/components/animated-tooltip/index.tsx'
import {BackgroundContainer} from '@/components/layout/container.tsx'
import {Header} from '@/components/layout/header.tsx'
import Domey from '@/images/ben.jpeg'
import Fiifi from '@/images/fiifi.jpeg'
import Ronnie from '@/images/ronnie.jpeg'
import Audrey from '@/images/audrey.jpeg'
import Nkay from '@/images/nkay.jpg'

const faqs = [
  {
    id: 1,
    question: 'What is mfoni?',
    answer:
      'mfoni is a photo gallery app in Ghana. It uses facial and image recognition to help users find photos from events and shows.',
  },
  {
    id: 2,
    question: 'How do I use it?',
    answer:
      'While mfoni is currently under development, you can stay updated by following our Twitter account for the latest news and announcements.',
  },
  {
    id: 3,
    question: 'Who is it for?',
    answer:
      'As an event organizer, freelance photographer, or someone who loves being in front of the camera, you can join our waitlist now!',
  },

  {
    id: 4,
    question: 'When will v0.1.0 launch?',
    answer:
      "We're aiming to launch v0.1.0 by Q1 2024, if not sooner. However, we'll keep you updated on our progress.",
  },
]

const people = [
  {
    id: 1,
    name: 'Domey',
    designation: 'Software Engineer',
    image: Domey,
  },
  {
    id: 2,
    name: 'Fiifi Jr.',
    designation: 'Software Engineer',
    image: Fiifi,
  },
  // {
  //   id: 3,
  //   name: 'Edward',
  //   designation: 'Software Engineer',
  //   image:
  //     'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
  // },
  {
    id: 4,
    name: 'Ronnie',
    designation: 'Project Manager',
    image: Ronnie,
  },
  {
    id: 5,
    name: 'Audrey',
    designation: 'Product Manager',
    image: Audrey,
  },
  {
    id: 6,
    name: 'Nana Anikuabe',
    designation: 'Software Engineer',
    image: Nkay,
  },
  // {
  //   id: 7,
  //   name: 'Noah',
  //   designation: 'Software Engineer',
  //   image:
  //     'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80',
  // },
]

export const LearnMoreModule = () => {
  return (
    <BackgroundContainer>
      <div className="flex flex-col justify-between items-center h-full">
        <div className="flex flex-col justify-center items-center ">
          <Header />
          <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold leading-10 tracking-tight text-black">
                Frequently asked questions
              </h2>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Have a different question and can’t find the answer you’re
                looking for? Reach out to our support team by{' '}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="mailto:support@mfoni.app"
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  sending us an email
                </a>{' '}
                and we’ll get back to you as soon as we can.
              </p>
            </div>
            <div className="mt-20">
              <dl className="space-y-16 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:gap-x-10">
                {faqs.map(faq => (
                  <div key={faq.id}>
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
        <div>
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="text-xl font-bold leading-10 tracking-tight text-gray-900">
              Meet the team
            </h2>
            <p className="2xl:my-3 my-3 md:my-2 text-base leading-7 text-gray-600">
              We’re a dynamic group of individuals who are passionate about what
              we do and dedicated to delivering the best results for our
              clients.
            </p>
          </div>
          <div className="flex flex-row items-center justify-center 2xl:my-10 my-10 md:my-8 w-full">
            <AnimatedTooltip items={people} />
          </div>
        </div>
      </div>
    </BackgroundContainer>
  )
}

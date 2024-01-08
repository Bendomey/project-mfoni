/* eslint-disable no-irregular-whitespace */
import {Header} from '@/components/layout/index.ts'

export const PolicyModule = () => {
  return (
    <>
      <Header isHeroSearchInVisible={false} shouldHeaderBlur={false} />
      <div className="bg-white  py-24 lg:py-32 ">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-base leading-7 text-gray-700">
          <h1 className="pb-24 sm:pb-40 text-4xl font-bold text-center tracking-tight text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>
        </div>
        <div className="bg-gray-50 max-w-8xl py-8 px-6 lg:px-8 text-base leading-7 text-gray-700">
          <div className="mx-auto max-w-3xl">
            <p className="mt-6 leading-8">
              Welcome to mfoni.app (the "Site"), hosted by Mfoni ("Mfoni", "we",
              "us", and/or "our"). Mfoni provides the concept of capturing
              moments and images, aligning with your goal of providing a
              platform for photographers and users to easily access and connect
              through facial recognition technology. (the "Services")​. We value
              your privacy and are dedicated to protecting your personal data.
              This Privacy Policy covers how we collect, handle, and disclose
              personal data on our Platform. If you have any questions,
              comments, or concerns regarding this Privacy Policy, our data
              practices, or would like to exercise your rights, do not hesitate
              to contact us.
            </p>
            <div className="mt-10 max-w-2xl">
              <h2 className="mt-16 text-2xl font-bold  text-gray-900">
                To Whom Does This Privacy Policy Apply
              </h2>
              <p className="mt-6">
                This Privacy Policy applies to customers and site visitors. Each
                customer is responsible for posting its own terms, conditions,
                and privacy policies, and ensuring compliance with all
                applicable laws and regulations.
              </p>
            </div>

            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold  text-gray-900">
                Changes To This Privacy Policy
              </h2>
              <p className="mt-6">
                This Privacy Policy may change from time to time, as our
                Platform and our business may change. Your continued use of the
                Platform after any changes to this Privacy Policy indicates your
                agreement with the terms of the revised Privacy Policy.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold  text-gray-900">
                What Information Do We Collect
              </h2>
              <p className="mt-6">
                We collect information directly from you when you provide it to
                us explicitly on our Site. We do not use third-party cookies on
                our Site.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold  text-gray-900">
                What We Use Your Information For
              </h2>
              <p className="mt-6">
                We use your information to provide our Services, to improve our
                Platform, to understand how you use our Platform, and to
                communicate with you.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold  text-gray-900">
                How to Contact Us
              </h2>
              <p className="mt-6">
                For privacy-related questions, please contact us at
                privacy@mfoni.app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

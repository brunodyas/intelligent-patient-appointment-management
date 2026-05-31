import React, { Fragment} from 'react';
import "../../globals.css"

import { Syne } from 'next/font/google'

const syne = Syne({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Fragment key={'add-job'}>
      <section className={`${syne.className} add-job-body`}>
        {children}
      </section>
    </Fragment>
  )
}

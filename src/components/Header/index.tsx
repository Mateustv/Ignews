import { SignInGit } from '../SignInGit'
import styles from './styles.module.scss'
import Link from 'next/link'
import { ActiveLink } from '../NextLink'

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <a href="/"><img src="/images/logo.svg" alt="logo" /></a>
        <nav>
          <ActiveLink activeClassName={styles.active} href="/">
            <a>Home</a>
          </ActiveLink>
          <ActiveLink activeClassName={styles.active} href="/posts" prefetch>
            <a>Posts</a>
          </ActiveLink>
        </nav>
        <SignInGit />
      </div>
    </header>
  )
}
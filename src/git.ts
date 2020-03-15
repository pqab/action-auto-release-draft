import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'

/**
 * Get changes introduced by tag
 * If there is previous version tag, get commit meesage between previous tag and current tag
 * Otherwise, get the commit message from current tag
 *
 * @param tag current tag
 */
export async function getChangesIntroducedByTag(
  tag: string
): Promise<string | null> {
  const previousVersionTag = await getPreviousVersionTag(tag)
  return previousVersionTag
    ? getCommitMessageBetween(previousVersionTag, tag)
    : getCommitMessageFrom(tag)
}

/**
 * Get previous version tag
 *
 * @param tag current tag
 */
export async function getPreviousVersionTag(
  tag: string
): Promise<string | null> {
  let previousTag = ''

  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        previousTag += data.toString()
      }
    },
    silent: true,
    ignoreReturnCode: true
  }

  const exitCode = await exec(
    'git',
    [
      'describe',
      '--match',
      'v[0-9]*',
      '--abbrev=0',
      '--first-parent',
      `${tag}^`
    ],
    options
  )

  core.debug(`The previous version tag is ${previousTag}`)

  return exitCode === 0 ? previousTag.trim() : null
}

/**
 * Get commit message between tag
 *
 * @param firstTag commit message from tag
 * @param secondTag commit message to tag
 */
export async function getCommitMessageBetween(
  firstTag: string,
  secondTag: string
): Promise<string | null> {
  let commitMessages = ''

  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        commitMessages += data.toString()
      }
    },
    silent: true
  }

  await exec(
    'git',
    ['log', '--format=%s', `${firstTag}..${secondTag}^`],
    options
  )

  core.debug(
    `The commit messages between ${firstTag} and ${secondTag} are:\n${commitMessages.trim()}`
  )

  return commitMessages.trim()
}

/**
 * Get commit message from tag
 *
 * @param tag commit message from tag
 */
export async function getCommitMessageFrom(
  tag: string
): Promise<string | null> {
  let commitMessages = ''

  const options: ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        commitMessages += data.toString()
      }
    },
    silent: true
  }

  await exec('git', ['log', '--format=%s', tag], options)

  core.debug(`The commit messages from ${tag} are:\n${commitMessages.trim()}`)

  return commitMessages.trim()
}

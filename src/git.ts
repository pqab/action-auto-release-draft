import * as core from "@actions/core"
import { exec } from "@actions/exec"
import { ExecOptions } from "@actions/exec/lib/interfaces"

export async function getChangesIntroducedBByTag(tag: string): Promise<string | null> {
    const previousVersionTag = await getPreviousVersionTag(tag)
    return previousVersionTag
        ? getCommitMessageBetween(previousVersionTag, tag)
        : getCommitMessageFrom(tag)
}

export async function getPreviousVersionTag(tag: string): Promise<string | null> {
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
        ['describe',
        '--match', 'v[0-9]*',
        '--abbrev=0',
        '--first-parent',
        `${tag}^`],
        options
    )

    core.debug(`The previous version tag is ${previousTag}`)

    return exitCode === 0 ? previousTag.trim() : null
}

export async function getCommitMessageBetween(firstTag: string, secondTag: string): Promise<string | null> {
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
        ['log',
        '--format=%s',
        `${firstTag}..${secondTag}^`],
        options
    )

    core.debug(`The commit messages between ${firstTag} and ${secondTag} are:\n${commitMessages.trim()}`)

    return commitMessages.trim()
}

export async function getCommitMessageFrom(tag: string): Promise<string | null> {
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
        ['log',
        '--format=%s',
        tag],
        options
    )

    core.debug(`The commit messages from ${tag} are:\n${commitMessages.trim()}`)

    return commitMessages.trim()
}
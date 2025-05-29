import fmt from '@/tools/format'
import parse from '@/tools/parse'
import { SprintfArgs } from '@/tools/types'

/**
 * Format a string according to the given format string and arguments
 */
export function sprintf<T extends string>(format: T, ...args: SprintfArgs<T>): string
export function sprintf(format: string, ...args: unknown[]): string
export function sprintf(format: string, ...args: unknown[]): string {
    return fmt(parse(format), args)
}

/**
 * Format a string according to the given format string and array of arguments
 */
export function vsprintf<T extends string>(format: T, args: SprintfArgs<T>): string
export function vsprintf(format: string, args: unknown[]): string
export function vsprintf(format: string, args: unknown[]): string {
    return sprintf(format, ...(args || []))
}

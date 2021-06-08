import { User, GameInstance } from "../types";

export type Candidate = {
  filename: string,
  chosen: boolean,
}

export type Submission = {
  id: number,
  author: User,
  gameInstance: GameInstance
  searchQuery: string,
  candidates: Candidate[],
  chosen: Candidate | null,
}

export type Guess = {
  guesser: User,
  author: User,
  imageSubmission: Submission,
  searchSubmission: Submission,
}

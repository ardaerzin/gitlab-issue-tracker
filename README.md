a simple issue tracker to track our team flow.

## Challenge
I had to work on this repo in order to keep track of team progress flow, which was mainly happening on Gitlab. however, gitlab interface felt limited and not so-friendly; thus a reporting layer was needed.

## Approach
This repo mainly acts as a bridge between Gitlab Issues and our google sheets with various filtering & query mechanisms.

- step 1: daily snapshots to see end-of-the-day status
- step 2: get individual action logs on sheets to measure individual specific actions, and to raise red flags whenever necessary.

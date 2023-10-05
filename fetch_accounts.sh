# Fetching programs
solana program dump -u m whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc whirpool.so

solana program dump -u m metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s token_metadata.so

# ToDo - Fetch accounts (whirpool, config)
solana account -u m 7qbRF6YsyGuLUVs6Y1q64bdVrfe4ZcUUz1JRdoVNUJnm --output-file whirpool_sol_usdc.json --output json-compact

solana account -u m 2LecshUwdy9xi7meFgHtFJQNSKk4KdTrcpvaB56dP2NQ --output-file whirpool_config.json --output json-compact

solana account -u m 9RfZwn2Prux6QesG1Noo4HzMEBv3rPndJ2bN2Wwd6a7p --output-file wrapped_sol.json --output json-compact

solana account -u m BVNo8ftg2LkkssnWT4ZWdtoFaevnfD6ExYeramwM27pe --output-file usdc.json --output json-compact

solana account -u m 5aN8t512S6WQEHnwXMZADP57oJWekVw892MnhJ7XYm1P --output-file orca_token.json --output json-compact

solana account -u m HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ --output-file whirpool_HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ.json --output json-compact


# solana account -u m 3YQm7ujtXWJU2e9jhp2QGHpnn1ShXn12QjvzMvDgabpX --output-file token_vaultA.json --output json-compact

# solana account -u m 5aN8t512S6WQEHnwXMZADP57oJWekVw892MnhJ7XYm1P --output-file token_vaultB.json --output json-compact
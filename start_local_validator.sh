
file_path = "concatenated_filenames.txt"
file_contents=$(cat "concatenated_filenames.txt")
#echo "$file_contents"

#solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so --account 7FTdQdMqkk5Xc2oFsYR88BuJt2yyCPReTpqr3viH6b6C nft.json  --account 4tSgNWeqtgp2kwRgjTqgpenP4wxfPaVCvganMR2gnd8W metadata.json 

#echo $file_contents

#solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so --account - ./sol_usdc_whirpool_accounts/Cs5rDG1yD8SBu3Es2YW8PwBhxLm8JijQTTZdtTCzGjuF.json --account - ./sol_usdc_whirpool_accounts/CSDCKnh8dztM9gSKiFyVc7wrTWzVZxEciLoEuX7WWyU7.json

solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so --account - whirpool_sol_usdc.json --account - whirpool_config.json --account - usdc.json --account - wrapped_sol.json --account - orca_token.json  $file_contents
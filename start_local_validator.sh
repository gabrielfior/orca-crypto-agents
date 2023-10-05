
file_path = "concatenated_filenames.txt"
file_contents=$(cat "concatenated_filenames.txt")

solana-test-validator -r --bpf-program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc whirpool.so --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s token_metadata.so --account - whirpool_HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ.json --account - whirpool_4adyau3Hq7dcTbMWJQ5eJqpyGtPdwYbuNtSydEMabxEG.json --account - whirpool_config.json  $file_contents
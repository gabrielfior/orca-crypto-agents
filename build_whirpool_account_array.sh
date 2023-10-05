#solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s metadata.so --account 7FTdQdMqkk5Xc2oFsYR88BuJt2yyCPReTpqr3viH6b6C nft.json  --account 4tSgNWeqtgp2kwRgjTqgpenP4wxfPaVCvganMR2gnd8W metadata.json 

#ls ./sol_usdc_whirpool_accounts > filenames.txt
#!/bin/bash

# Specify the directory you want to work with
MY_DIRECTORY="./whirpool_json_data"

# Check if the directory exists
if [ ! -d "$MY_DIRECTORY" ]; then
  echo "Directory does not exist: $MY_DIRECTORY"
  exit 1
fi

# Initialize an empty array to store the new filenames
new_filenames=()

# Loop through each file in the directory
for file in "$MY_DIRECTORY"/*; do
  # Check if the file is a regular file
  if [ -f "$file" ]; then
    # Extract the filename without the path
    #filename=$(basename "$file")
    
    # Add the desired prefix
    new_filename="--account - $file"

    
    # Add the new filename to the array
    new_filenames+=("$new_filename")
  fi
done

# Concatenate all items in the array with a space
concatenated_filenames="${new_filenames[*]}"

# Write the concatenated filenames to a file
output_file="./concatenated_filenames.txt"
echo "$concatenated_filenames" > "$output_file"

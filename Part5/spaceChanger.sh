echo "Changing files"
for file in *.js
do
    newfile=("NEW""$file")
    echo $newfile
    sed 's/    /  /g' < $file > $newfile
done
echo "Moving updated files into place"

for file in NEW*
do
    oldfile=${file:3}
    echo $oldfile
    mv $file $oldfile
done

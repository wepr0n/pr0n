#!/bin/bash

echo -n "Version: "
VERSION=$(cat install.rdf | grep em:version | cut -d\> -f2 | cut -d\< -f1)
if [ "$VERSION" = "" ]; then
    echo 'Error getting the version.'
    exit 1
fi
echo "$VERSION"

echo -n "Create tmp dir: "
rm -rf TMP "pr0n-$VERSION.xpi" && mkdir TMP
if [ "$?" != 0 ]; then
    echo 'Error creating the tmp dir'
    exit 1
fi
echo "done."

echo -n "Creating archive: "
git archive master --format zip > TMP/"pr0n-$VERSION.xpi"
if [ "$?" != 0 ]; then
    echo 'Error creating the archive.'
    exit 1
fi
echo "done."

echo -n "Unzipping archive: "
cd TMP && unzip "pr0n-$VERSION.xpi" &>/dev/null && rm "pr0n-$VERSION.xpi"
if [ "$?" != 0 ]; then
    echo 'Error unzipping the archive'
    exit 1
fi
echo "done."

echo -n "Recreating archive: "
rm update_template.rdf do.sh && zip -r "../pr0n-$VERSION.xpi" * &>/dev/null && cd .. && rm -rf TMP
if [ "$?" != 0 ]; then
    echo 'Error creating the archive'
    exit 1
fi
echo "done."

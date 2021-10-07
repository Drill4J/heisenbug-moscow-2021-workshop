#!/bin/sh
printhelp="false"

while getopts ":h" OPTKEY; do
  case $OPTKEY in
    h) printhelp="true"
    ;;
    \?) echo "$0: Invalid option -$OPTKEY; Pass -h flag to see help menu" >&2
    exit 1
    ;;
  esac
done

if $printhelp
then
  echo "$0: fetch tests2run list from Drill4J Backend and echo test names for cypress-grep"
  echo "OPTIONS"
  echo "-h   help:    print this help menu"
  echo "              *make sure to set the following variables in .env file"               
  echo "              DRILL_ADMIN_URL - Drill4J admin backend address starting with http(s)://"
  echo "              DRILL_AGENT_ID  - application agent id in Drill4J (lowercase latin, dashes)"
  echo ""
  exit 0
fi

# read variables from .env file
export eval $(egrep -v '^#' .env | xargs)

# check if required variables are set
if [[ -z $DRILL_AGENT_ID ]] || [[ -z $DRILL_ADMIN_URL ]]
then
  echo "Please set both DRILL_AGENT_ID and DRILL_ADMIN_URL in .env file"
  exit 1
fi

URL="${DRILL_ADMIN_URL%$'\r'}/api/agents/${DRILL_AGENT_ID%$'\r'}/plugins/test2code/data/tests-to-run"

tests2run=$(curl -s -H "accept: application/json" -H "content-type: application/json" -X GET "$URL")

tests=$(jq -r '.byType.AUTO | map(.name) | join ("; ")' <<< $tests2run)
specs=$(jq -r '.byType.AUTO | map(.metadata.data.specFilePath) | unique | join (",")' <<< $tests2run)

echo 'specs to run'
echo $specs

echo 'tests to run'
echo $tests

node_modules/.bin/cypress run --spec="${specs}" --env grep="${tests}"

#!/bin/bash
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

tests2run=$(curl -s -H "accept: application/json" -H "content-type: application/json" -X GET $DRILL_ADMIN_URL/api/agents/$DRILL_AGENT_ID/plugins/test2code/data/tests-to-run)
formatted=$(jq -r '.byType.AUTO | map(.name) | join ("; ")' <<< $tests2run)
echo $formatted

# TIP: launch tests using tests2runs:
#
#   Cypress local installation
#   node_modules/.bin/cypress run --env grep="$(./tests2run.sh)"
#
#   Cypress global installation
#   npx cypress run --env grep="$(./tests2run.sh)"

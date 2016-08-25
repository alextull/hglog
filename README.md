# hglog
huntgroup logon/logoff for 3rd party devices for Cisco Callmanager via AXL interface

requires Asterisk installation
tested with Asterisk 11.21.1

extensions.conf:

; DTMF featurecodes
exten => _*XX*,1,Answer()
exten => _*XX*,n,NoOp(${CALLERID(num)})
;exten => _*XX*,n,System(perl /var/lib/asterisk/agi-bin/updatephone_hlog.pl ${EXTEN} ${CALLERID(num)})
;exten => _*XX*,n,System(node /var/lib/asterisk/agi-bin/hglog_arg.js ${EXTEN} ${CALLERID(num)})
exten => _*XX*,n,Set(CURL_RESULT=${CURL(http://192.168.20.232:3000/hglog?cdpn=${EXTEN}&cgpn=${CALLERID(num)})})
exten => _*XX*,n,NoOp(${CURL_RESULT})
exten => _*XX*,n,Festival(${CURL_RESULT})
exten => _*XX*,n,Wait(1)
exten => _*XX*,n,Festival('good bye. see you next time')
exten => _*XX*,n,Hangup()



requires Festival server for TTS
start festival quick and dirty from console, send process to background:
festival --server &




start application:

node main.js

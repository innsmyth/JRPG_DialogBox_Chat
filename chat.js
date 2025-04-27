let totalMessages = 0, messagesLimit = 0, colorCycle = 0, nickColor = "user", removeSelector, addition, customNickColor, channelName,
    provider;
let animationIn = 'fadeInUp';
let animationOut = 'fadeOut';
let hideAfter = 60;
let hideCommands = "no";
let ignoredUsers = [];
let iTextPosDef = 0;
let iSpeedDef = 30;
let iTextPos = iTextPosDef; // initialise text position
let iSpeed = iSpeedDef; // time delay of print out
let myMessage = "default";

window.addEventListener('onEventReceived', function (obj) {
    if (obj.detail.event.listener === 'widget-button') {

        if (obj.detail.event.field === 'testMessage') {
            let emulated = new CustomEvent("onEventReceived", {
                detail: {
                    listener: "message", event: {
                        service: "twitch",
                        data: {
                            time: Date.now(),
                            tags: {
                                "badge-info": "",
                                badges: "moderator/1,partner/1",
                                color: "#5B99FF",
                                "display-name": "StreamElements",
                                emotes: "25:46-50",
                                flags: "",
                                id: "43285909-412c-4eee-b80d-89f72ba53142",
                                mod: "1",
                                "room-id": "85827806",
                                subscriber: "0",
                                "tmi-sent-ts": "1579444549265",
                                turbo: "0",
                                "user-id": "100135110",
                                "user-type": "mod"
                            },
                            nick: channelName,
                            userId: "100135110",
                            displayName: channelName,
                            displayColor: "#5B99FF",
                            badges: [{
                                type: "moderator",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
                                description: "Moderator"
                            }, {
                                type: "partner",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
                                description: "Verified"
                            }],
                            channel: channelName,
                            text: "Howdy! My name is Bill and I am here to serve apoushdfpa uahsdpoiuh aufbnaosi dfnoa sn;osdhjfpj fdgh Kappa",
                            isAction: !1,
                            emotes: [{
                                type: "twitch",
                                name: "Kappa",
                                id: "25",
                                gif: !1,
                                urls: {
                                    1: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    2: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    4: "https://static-cdn.jtvnw.net/emoticons/v1/25/3.0"
                                },
                                start: 46,
                                end: 50
                            }],
                            msgId: "43285909-412c-4eee-b80d-89f72ba53142"
                        },
                        renderedText: 'Howdy! My name is Bill and I am here to serve <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/25/3.0 4x" title="Kappa" class="emote">'
                    }
                }
            });
            window.dispatchEvent(emulated);
        }
        return;
    }
    if (obj.detail.listener === "delete-message") {
        const msgId = obj.detail.event.msgId;
        $(`.message-row[data-msgid=${msgId}]`).remove();
        return;
    } else if (obj.detail.listener === "delete-messages") {
        const sender = obj.detail.event.userId;
        $(`.message-row[data-sender=${sender}]`).remove();
        return;
    }
    
    addAvatar();
    if (obj.detail.listener !== "message") return;
    let data = obj.detail.event.data;
    if (data.text.startsWith("!") && hideCommands === "yes") return;
    if (ignoredUsers.indexOf(data.nick) !== -1) return;
    removeRow();
    let message = attachEmotes(data);
    let badges = "", badge;
    if (provider === 'mixer') {
        data.badges.push({url: data.avatar});
    }
    for (let i = 0; i < data.badges.length; i++) {
        badge = data.badges[i];
        badges += `<img alt="" src="${badge.url}" class="badge"> `;
    }
    let username = data.displayName;
    username = `${username}`;
    addMessage(username, badges, message, data.isAction, data.userId, data.msgId);
});

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    animationIn = fieldData.animationIn;
    animationOut = fieldData.animationOut;
    hideAfter = fieldData.hideAfter;
    messagesLimit = fieldData.messagesLimit;
    nickColor = fieldData.nickColor;
    customNickColor = fieldData.customNickColor;
    hideCommands = fieldData.hideCommands;
    channelName = obj.detail.channel.username;
    fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
        provider = profile.provider;
    });
    if (fieldData.alignMessages === "block") {
        addition = "prepend";
        removeSelector = ".message-row:nth-child(n+" + (messagesLimit + 1) + ")"
    } else {
        addition = "append";
        removeSelector = ".message-row:nth-last-child(n+" + (messagesLimit + 1) + ")"
    }

    ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");
});


function attachEmotes(message) {
    let text = html_encode(message.text);
    let data = message.emotes;
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text
        .replace(
            /([^\s]*)/gi,
            function (m, key) {
                let result = data.filter(emote => {
                    return html_encode(emote.name) === key
                });
                if (typeof result[0] !== "undefined") {
                    let url = result[0]['urls'][1];
                    if (provider === "twitch") {
                        return `<img class="emote" " src="${url}"/>`;
                    } else {
                        if (typeof result[0].coords === "undefined") {
                            result[0].coords = {x: 0, y: 0};
                        }
                        let x = parseInt(result[0].coords.x);
                        let y = parseInt(result[0].coords.y);

                        let width = "18px";
                        let height = "auto";

                        if (provider === "mixer") {
                            console.log(result[0]);
                            if (result[0].coords.width) {
                                width = `${result[0].coords.width}px`;
                            }
                            if (result[0].coords.height) {
                                height = `${result[0].coords.height}px`;
                            }
                        }
                        return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
                    }
                } else return key;

            }
        );
}

function html_encode(e) {
    return e.replace(/[<>"^]/g, function (e) {
        return "&#" + e.charCodeAt(0) + ";";
    });
}

function addAvatar(){
    const element = $.parseHTML(`
        <div class="avatar">
            <img src="https://i.imgur.com/KsRCTtI.png">
        </div>
    `);
    if (hideAfter !== 999) {
        $(element).appendTo('.avatar-container').delay(hideAfter * 1000).queue(function () {
            $(this).removeClass(animationIn).addClass(animationOut).delay(1000).queue(function () {
                $(this).remove()
            }).dequeue();
        });
    } else {
        $(element).appendTo('.avatar-container');
    }
}

function addMessage(username, badges, message, isAction, uid, msgId) {
    totalMessages += 1;
    let actionClass = "";
    if (isAction) {
        actionClass = "action";
    }
    if (colorCycle == 0) {
      const element = $.parseHTML(`
      <div data-sender="${uid}" data-msgid="${msgId}" class="message-row {animationIn} animated" id="msg-${totalMessages}">
        <div class="stars"><svg height="48" width="48">
                <circle cx="24" cy="24" r="23" stroke="#5044e8" stroke-width="2" fill="none" />
            </svg>
            <icon class="fa-solid fa-diamond" style="color: #f6cb77;" />
        </div>
        <div class="msgContainer">
          <div class="user-box ${actionClass}" style="color: #5044e8 !important;"><div class="badges">${badges}</div>${username}</div>
          <div class="dots" style="color: #5d50ff !important;">..</div><div id="typed-message" class="user-message ${actionClass}"></div>
        </div>
      </div>`);
      if (addition === "append") {
          if (hideAfter !== 999) {
              $(element).appendTo('.main-container').delay(hideAfter * 1000).queue(function () {
                  $(this).removeClass(animationIn).addClass(animationOut).delay(0).queue(function () {
                      $(this).remove()
                  }).dequeue();
              });
          } else {
              $(element).appendTo('.main-container');
          }
      } else {
          if (hideAfter !== 999) {
              $(element).prependTo('.main-container').delay(hideAfter * 1000).queue(function () {
                  $(this).removeClass(animationIn).addClass(animationOut).delay(0).queue(function () {
                      $(this).remove()
                  }).dequeue();
              });
          } else {
              $(element).prependTo('.main-container');
          }
      }
      myMessage = message;
      iTextPos = iTextPosDef;
      iSpeed = iSpeedDef;
      typewriter();
      colorCycle += 1;
    }
  
    else if (colorCycle == 1) {
      const element = $.parseHTML(`
      <div data-sender="${uid}" data-msgid="${msgId}" class="message-row {animationIn} animated" id="msg-${totalMessages}">
        <div class="stars"><svg height="48" width="48">
                <circle cx="24" cy="24" r="23" stroke="#f6cb77" stroke-width="2" fill="none" />
            </svg>
            <icon class="fa-regular fa-eye" style="color: #5044e8;" />
        </div>
        <div class="msgContainer">
          <div class="user-box ${actionClass}" style="color: #ffd17a !important;"><div class="badges">${badges}</div>${username}</div>
          <div class="dots" style="color: #ffd17a !important;">..</div><div id="typed-message" class="user-message ${actionClass}"></div>
        </div>
      </div>`);
      if (addition === "append") {
          if (hideAfter !== 999) {
              $(element).appendTo('.main-container').delay(hideAfter * 1000).queue(function () {
                  $(this).removeClass(animationIn).addClass(animationOut).delay(0).queue(function () {
                      $(this).remove()
                  }).dequeue();
              });
          } else {
              $(element).appendTo('.main-container');
          }
      } else {
          if (hideAfter !== 999) {
              $(element).prependTo('.main-container').delay(hideAfter * 1000).queue(function () {
                  $(this).removeClass(animationIn).addClass(animationOut).delay(0).queue(function () {
                      $(this).remove()
                  }).dequeue();
              });
          } else {
              $(element).prependTo('.main-container');
          }
      }
      myMessage = message;
      iTextPos = iTextPosDef;
      iSpeed = iSpeedDef;
      typewriter();
      colorCycle = 0;
    }

    if (totalMessages > messagesLimit) {
        removeRow();
    }
}

function removeRow() {
    if (!$(removeSelector).length) {
        return;
    }
    if (animationOut !== "none" || !$(removeSelector).hasClass(animationOut)) {
        if (hideAfter !== 999) {
            $(removeSelector).dequeue();
        } else {
            $(removeSelector).addClass(animationOut).delay(0).queue(function () {
                $(this).remove().dequeue()
            });

        }
        return;
    }

    $(removeSelector).animate({
        height: 0,
        opacity: 0
    }, 'slow', function () {
        $(removeSelector).remove();
    });
}

function typewriter()
{
    var newMsg = ('' + myMessage);
    var sContents = ''; // initialise contents variable
    var iMsgLength = newMsg.length; // the length of the msg
    var iIndex = 0; // start printing array at this posision
    var iRow = 0; // initialise current row

    var destination = document.getElementById("typed-message");

    while ( iRow < iIndex-1 ) {
        sContents += newMsg[iRow++] + '<br />';
    }

    if ( newMsg.substring(iTextPos, iTextPos+1) === "<" ){ //&#60
        iSpeed = 0;
    }
    if ( newMsg.substring(iTextPos, iTextPos+1) === ">" ){ //&#62
        iSpeed = iSpeedDef;
    }

    destination.innerHTML = sContents + newMsg.substring(0, iTextPos) + "";
    if ( iTextPos++ != iMsgLength ) {
        setTimeout("typewriter()", iSpeed);
    }
}
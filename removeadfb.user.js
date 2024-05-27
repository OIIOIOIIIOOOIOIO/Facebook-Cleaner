// ==UserScript==
// @name         Facebook Feed Cleaner
// @namespace    http://oiioioiiioooioio.download
// @version      1.1
// @description  Cleans up the Facebook feed by removing sponsored and suggested posts
// @author       NEXT
// @match        *://*.facebook.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
  "use strict";

  function randomString(length) {
    let result = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  let show_log = false;
  let show_count_message = true;

  let count_list = [
    { name: "sponsor", value: GM_getValue("sponsor", 0) },
    { name: "sidebar", value: GM_getValue("sidebar", 0) },
    { name: "suggest", value: GM_getValue("suggest", 0) },
    { name: "reel", value: GM_getValue("reel", 0) },
  ];

  let processSponsor = GM_getValue("processSponsor", true);
  let processSidebar = GM_getValue("processSidebar", true);
  let processSuggest = GM_getValue("processSuggest", true);
  let processReel = GM_getValue("processReel", true);

  let focusInEvent = new Event("focusin", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  let focusOutEvent = new Event("focusout", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  function retrieveConfiguration() {
    processSponsor = JSON.parse(localStorage.getItem("sponsor")) ?? true;
    processSidebar = JSON.parse(localStorage.getItem("sidebar")) ?? true;
    processSuggest = JSON.parse(localStorage.getItem("suggest")) ?? true;
    processReel = JSON.parse(localStorage.getItem("reel")) ?? true;
    cleanFeed();
  }

  function removeSponsoredPost() {
    if (!processSponsor) return;

    let feed = document.querySelector("div[role='main']");
    if (!feed) return;

    let aTagArray = feed.querySelectorAll(
      'a[role="link"][target="_blank"]:not([href*="https:"]):not([routed=\'true\'])'
    );
    if (aTagArray != null) {
      aTagArray.forEach((aTag) => {
        aTag.setAttribute("routed", "true");
        aTag.dispatchEvent(focusInEvent);
        aTag.dispatchEvent(focusOutEvent);
      });
    }

    window.setTimeout(function () {
      let targetArray = feed.querySelectorAll("a[href*='/ads/about/']");
      if (targetArray != null) {
        targetArray.forEach((target) => {
          let removeTarget = target.closest("div[role='article']");
          if (removeTarget) {
            if (show_count_message) count_list[0].value++;
            if (!show_log) return removeTarget.remove();

            removeTarget.style.display = "none";
            let message = document.createElement("div");
            message.innerHTML = "Sponsored post removed : Ref " + randomString(5);
            message.style.color = "red";
            message.style.fontSize = "12px";
            message.style.margin = "10px";
            removeTarget.parentNode.insertBefore(message, removeTarget);
            removeTarget.removeAttribute("role");
          }
        });
      }
    }, 500);
  }

  function removeSuggestedPost() {
    if (!processSuggest) return;

    let feed = document.querySelector("div[role='main']");
    if (!feed) return;

    let target = feed.querySelectorAll("h4:not([reviewed='true'])");
    target.forEach(function (t) {
      t.setAttribute("reviewed", "true");

      if (
        t.lastChild !== null &&
        t.lastChild.lastChild !== null &&
        t.lastChild.lastChild.role === "button"
      ) {
        let removeTarget = t.closest("div[aria-posinset]");
        if (removeTarget) {
          if (show_count_message) count_list[2].value++;
          if (!show_log) return removeTarget.remove();

          removeTarget.style.display = "none";
          let message = document.createElement("div");
          message.innerHTML = "Suggested post removed : Ref " + randomString(5);
          message.style.color = "red";
          message.style.fontSize = "12px";
          message.style.margin = "10px";
          removeTarget.parentNode.insertBefore(message, removeTarget);
        }
      } else if (
        t.parentNode.parentNode.nextSibling !== null &&
        t.parentNode.parentNode.nextSibling.firstChild !== null &&
        t.parentNode.parentNode.nextSibling.firstChild.firstChild !== null &&
        t.parentNode.parentNode.nextSibling.firstChild.firstChild.childNodes !==
        null
      ) {
        let nodes =
          t.parentNode.parentNode.nextSibling.firstChild.firstChild.childNodes;
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].firstElementChild == null) {
            let removeTarget = t.closest("div[aria-posinset]");
            if (removeTarget) {
              if (show_count_message) count_list[2].value++;
              if (!show_log) return removeTarget.remove();

              removeTarget.style.display = "none";
              let message = document.createElement("div");
              message.innerHTML = "Suggested post removed : Ref " + randomString(5);
              message.style.color = "red";
              message.style.fontSize = "12px";
              message.style.margin = "10px";
              removeTarget.parentNode.insertBefore(message, removeTarget);

            }
            break;
          }
        }
      }
    });
  }

  function removeReel() {
    if (!processReel) return;

    let feed = document.querySelector("div[role='main']");
    if (!feed) return;

    let target = feed.querySelectorAll(
      "a[href*='/reel/']:not([reviewed='true'])"
    );
    target.forEach(function (t) {
      t.setAttribute("reviewed", "true");

      let removeTarget = t.closest("div[aria-posinset]");
      if (removeTarget) {
        if (show_count_message) count_list[3].value++;
        if (!show_log) return removeTarget.remove();

        removeTarget.style.display = "none";
        let message = document.createElement("div");
        message.innerHTML = "Reel removed";
        message.style.color = "red";
        message.style.fontSize = "12px";
        message.style.margin = "10px";
        removeTarget.parentNode.insertBefore(message, removeTarget);

      }
    });
  }

  function removeRightSidebarAdvertisement() {
    if (!processSidebar) return;

    let noRail = document.querySelector("div[data-pagelet='NoRail']");
    if (noRail != null) {
      let rightSidebarTarget = noRail.querySelector(
        ":scope > div[data-visualcompletion='ignore-dynamic']"
      );
      if (rightSidebarTarget != null) {
        rightSidebarTarget.parentNode
          .querySelectorAll(
            ":scope > div:not([data-visualcompletion='ignore-dynamic'])"
          )
          .forEach(function (e) {
            if (show_count_message) count_list[1].value++;
            e.style.display = "none";
            let message = document.createElement("div");
            message.innerHTML = "Right sidebar ad removed : Ref " + randomString(5);
            message.style.color = "red";
            message.style.fontSize = "12px";
            message.style.margin = "10px";
            e.parentNode.insertBefore(message, e);

          });
      }
    }
  }

  function showCountRemove() {
    let footer = document.querySelector("footer[aria-label='Facebook']");
    if (footer != null) {
      let count = count_list.reduce((acc, cur) => acc + cur.value, 0);
      let existingMessage = footer.querySelector(".count-message");
      if (existingMessage) {
        existingMessage.innerHTML = `Removed Posts: Sponsored(${count_list[0].value}), Sidebar(${count_list[1].value}), Suggested(${count_list[2].value}), Reel(${count_list[3].value})`;
      } else {
        let message = document.createElement("div");
        message.className = "count-message";
        message.innerHTML = `Removed Posts: Sponsored(${count_list[0].value}), Sidebar(${count_list[1].value}), Suggested(${count_list[2].value}), Reel(${count_list[3].value})`;
        message.style.color = "red";
        message.style.fontSize = "12px";
        message.style.marginTop = "10px";
        footer.appendChild(message);
      }
    }
  }

  function cleanFeed() {
    removeSponsoredPost();
    removeSuggestedPost();
    removeReel();
    removeRightSidebarAdvertisement();
    if (show_count_message) showCountRemove();
  }

  retrieveConfiguration();

  setInterval(function () {
    cleanFeed();
  }, 500);

  window.addEventListener("storage", function (e) {
    retrieveConfiguration();
  });
})();

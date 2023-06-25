<script setup lang="ts">
import { savedTabList } from '~/logic/storage'
import { getMessage } from '~/background/i18n'

const parsedSavedTabList = computed<NoteTab[]>(() => {
  const parsedSavedTabList: Array<NoteTab> = JSON.parse(savedTabList.value);
  console.log(parsedSavedTabList);
  if (parsedSavedTabList.length === 0) {
    parsedSavedTabList.push({
      uuid: crypto.randomUUID(),
      title: getMessage("newTabTitle"),
      isUnderEditTitle: false,
      text: '',
      active: true
    });
  }
  const activeTab: NoteTab | undefined = parsedSavedTabList.find((tabItem: NoteTab) => tabItem.active);
  if (!activeTab) {
    parsedSavedTabList[parsedSavedTabList.length - 1].active = true;
  }

  return parsedSavedTabList;
});

// watch(parsedSavedTabList, (next, prev) => {
//   savedTabList.value = JSON.stringify(parsedSavedTabList.value);
// });

// const tabList: Ref<Array<NoteTab>> = ref([]);
const activateDate: Ref<Date> = ref(new Date());
const textCount: Ref<number> = ref(0);
const lineCount: Ref<number> = ref(0);
const showSavedText: Ref<boolean> = ref(false);
// const noteAreaText: Ref<string> = ref("");

// watch(noteAreaText, (next, prev) => {
//   console.log("noteAreaText",noteAreaText.value);
//   const parsedSavedTabList = JSON.parse(savedTabList.value);
//   if (parsedSavedTabList.length === 0) {
//     return "";
//   }
//   const activeTab: NoteTab | undefined = parsedSavedTabList.find((tabItem: NoteTab) => tabItem.active);
//   activeTab.text = noteAreaText.value;
//   return noteAreaText;
// });

// const noteAreaText = computed<string>(() => {
//   const parsedSavedTabList = JSON.parse(savedTabList.value);
//   if (parsedSavedTabList.length === 0) {
//     return "";
//   }
//   const activeTab: NoteTab | undefined = parsedSavedTabList.find((tabItem: NoteTab) => tabItem.active);
//   return activeTab ? activeTab.text : "";
// });


console.log(parsedSavedTabList);
function fetchIframe(event: any) {
  const activeTab: NoteTab | undefined = parsedSavedTabList.value.find(tabItem => tabItem.active);
  const fetchUrl: string = event.target.value;
  if (!fetchUrl) {
    return; // URLが空なのでリターン、何もしない
  }
  const fetchDomain = fetchUrl.replaceAll(/http.*?\/\//g, "").replaceAll(/\/.*/g, "");
  if (activeTab) {
    activeTab.active = true;
    activeTab.text = fetchUrl;
    activeTab.title = activeTab.title ? activeTab.title : fetchDomain;
    parsedSavedTabList.value.forEach(tabItem => {
      if (tabItem.uuid === activeTab.uuid) {
        tabItem = activeTab;
      }
    });
  } else {
    crypto.randomUUID();
    parsedSavedTabList.value.push({
      uuid: crypto.randomUUID(),
      title: fetchDomain,
      text: "",
      isUnderEditTitle: false,
      active: true
    });
  }
  savedTabList.value = JSON.stringify(parsedSavedTabList.value);
  // activateDate.value = new Date();
  // nextTick(() => activateDate.value = new Date());
  // document.getElementById('iframeID').src += '';
  document.getElementById("iframe-content").src += ''; // リロードさせる
  // document.getElementsByClassName(".iframe-element").item(0).src = "";
}

function fetchTabText() {
  const activeTab: NoteTab | undefined = parsedSavedTabList.value.find(tabItem => tabItem.active);
  if (activeTab) {
    textCount.value = activeTab.text ? activeTab.text.length : 0;
    lineCount.value = activeTab.text ? activeTab.text.split("\n").length : 0;
    return activeTab?.text;
  }
  return "";
}

function fetchTabTitle() {
  const activeTab: NoteTab | undefined = parsedSavedTabList.value.find(tabItem => tabItem.active);
  return activeTab?.title;
}

function saveTabText() {
  console.log("saveTabText()");
  let activeTab: NoteTab | undefined = parsedSavedTabList.value.find(tabItem => tabItem.active);
  const textAreaValue = document.querySelector("#note-area")?.value;
  if (!activeTab || textAreaValue === activeTab.text) {
    return; // テキストが変更されてない場合は何もしない
  }
  activeTab.text = document.querySelector("#note-area")?.value;
  savedTabList.value = JSON.stringify(parsedSavedTabList.value);
  if (activeTab) {
    textCount.value = activeTab.text ? activeTab.text.length : 0;
    lineCount.value = activeTab.text ? activeTab.text.split("\n").length : 0;
  }
  showFadeSavedText();
}


function deleteTab(deleteTab: NoteTab) {
  if (!confirm(getMessage("confirmDeleteText"))) {
    return; // cancel
  }
  parsedSavedTabList.value.forEach(tabItem => tabItem.active = false);
  let deleteTargetTabIdx = 1;
  parsedSavedTabList.value.forEach((tabItem, index) => {
    if (tabItem.uuid === deleteTab.uuid) {
      deleteTargetTabIdx = index;
    }
  });
  console.log("parsedSavedTabList", parsedSavedTabList);
  let deletedParsedSavedTabList = parsedSavedTabList.value.filter((tabItem: NoteTab) => tabItem.uuid !== deleteTab.uuid);
  console.log("deleteTargetTabIdx", deleteTargetTabIdx);
  deletedParsedSavedTabList.forEach((tabItem, index) => {
    console.log("index:tab", index)
    if (index == deleteTargetTabIdx - 1) {
      tabItem.active = true;
      console.log("tabItem.active", tabItem)
    }
  });
  console.log("deletedParsedSavedTabList", deletedParsedSavedTabList);
  savedTabList.value = JSON.stringify(deletedParsedSavedTabList);
}

function createTab() {
  parsedSavedTabList.value.forEach(tabItem => tabItem.active = false);
  parsedSavedTabList.value.push({
    uuid: crypto.randomUUID(),
    title: getMessage("newTabTitle"),
    text: '',
    active: true
  });
  savedTabList.value = JSON.stringify(parsedSavedTabList.value);
}

function activateTab(e: Event, tab: NoteTab) {
  e.stopPropagation();
  parsedSavedTabList.value.forEach(tabItem => {
    if (tab.uuid === tabItem.uuid) {
      tabItem.active = true;
    } else {
      tabItem.active = false;
    }
  });
  savedTabList.value = JSON.stringify(parsedSavedTabList.value);
}

async function editTitle(tab: NoteTab) {
  savedTabList.value = JSON.stringify(parsedSavedTabList.value.map((tabItem) => {
    if (tabItem.uuid === tab.uuid) {
      tabItem.isUnderEditTitle = true;
    }
    return tabItem;
  }));
  let editTitleInput = document.getElementById("tab-title-" + tab.uuid);
  if (editTitleInput) {
    await nextTick();
    editTitleInput.focus();
  }
}

function bindTitle(tab: NoteTab) {
  savedTabList.value = JSON.stringify(parsedSavedTabList.value.map((tabItem) => {
    if (tabItem.uuid === tab.uuid) {
      tabItem.isUnderEditTitle = false;
    }
    return tabItem;
  }));
}

function getTime() {
  const nowTime = new Date();
  var area = document.getElementById('note-area');
  var text = nowTime.toISOString().replaceAll(/T/g, " ").replaceAll(/Z/g, "");
  //カーソルの位置を基準に前後を分割して、その間に文字列を挿入
  area.value = area.value.substr(0, area.selectionStart)
    + text
    + area.value.substr(area.selectionStart) + "\n";
  saveTabText();
}

const QueryInWindow = {
  windowId: chrome.windows.WINDOW_ID_CURRENT,
};

function showFadeSavedText() {
  showSavedText.value = true;
  setTimeout(() => {
    showSavedText.value = false;
  }, 3000);
}

async function getSelectTabTitleAndUrl() {
  const tabs = await chrome.tabs.query(QueryInWindow);
  const selectedTabs = tabs.filter((tabItem: chrome.tabs.Tab) => tabItem.highlighted);
  const selectedTabsFlatMap = selectedTabs.flatMap((tabItem: chrome.tabs.Tab) => `${tabItem.title}\n${tabItem.url}`);
  const insertTabInfoText = selectedTabsFlatMap.join("\n");
  var area = document.getElementById('note-area');
  //カーソルの位置を基準に前後を分割して、その間に文字列を挿入
  area.value = area.value.substr(0, area.selectionStart)
    + insertTabInfoText
    + area.value.substr(area.selectionStart) + "\n";
  saveTabText();
}

function init() {
  let activeTab = parsedSavedTabList.value.find(tabItem => tabItem.active);
  if (activeTab) {
    parsedSavedTabList.value[0].active = true;
  }
  savedTabList.value = JSON.stringify(parsedSavedTabList.value);
  activateDate.value = new Date();

}
init();
</script>

<template>
  <div class="popup-container">
    <div class="tabs-container">

      <template v-if="parsedSavedTabList.length > 0">
        <div class="tab-item-container scroll_bar d-flex">

          <template v-for="tab of parsedSavedTabList">
            <div class="tab-item px-2 py-1 d-flex justify-content-between"
              :class="tab.active ? 'tab-active' : 'tab-passive'" @click="activateTab($event, tab)"
              @dblclick="editTitle(tab)">
              <div class="d-flex align-items-center">
                <div v-if="!tab.isUnderEditTitle" class="tab-item-title text-truncate cursor-pointer">{{
                  tab.title }}</div>
              </div>
              <input :class="tab.isUnderEditTitle ? '' : 'd-none'" class="me-2 tab-title-input" type="text"
                :id="'tab-title-' + tab.uuid" v-model="tab.title" v-on:keydown.enter="bindTitle(tab)"
                v-on:blur="bindTitle(tab)">
              <div class="cursor-pointer" @click="deleteTab(tab)" v-if="tab.active">
                <material-symbols:close />
              </div>
            </div>
            <div class="d-flex align-items-center item-border-box">
              <div class="item-border"></div>
            </div>
          </template>
          <div class="tab-plus px-2 py-1 d-flex justify-content-between">
            <div class="tab-item-title text-truncate cursor-pointer" @click="createTab()">
              <ic:baseline-plus />
            </div>
          </div>

        </div>
      </template>

      <div class="d-flex justify-content-between">
        <div class="tools-container d-flex flex-row align-items-center px-2 my-2">
          <div class="iframe-reload cursor-pointer mx-2" :title="getMessage('insertTimeText')" @click="getTime()">
            <ion:time-outline />
          </div>
          <div class="iframe-reload cursor-pointer mx-2" :title="getMessage('insertSelectedTabText')"
            @click="getSelectTabTitleAndUrl()">
            <lucide:link />
          </div>
        </div>
        <div class="d-flex align-items-center">
          <transition name="fade">
            <div v-show="showSavedText" class="mx-2">[{{ fetchTabTitle() }}] {{ getMessage("savedText") }}</div>
          </transition>
          <div class="mx-2">{{ getMessage("lineCountText") + lineCount }}</div>
          <div class="mx-2">{{ getMessage("textCountText") + textCount }}</div>
        </div>
      </div>

      <!-- note-area -->
      <div class="note-body m-1">
        <textarea class="note-area-element" name="note-area-element" id="note-area" cols="30" rows="10"
          @keyup="saveTabText()" @mouseup="saveTabText()" :value="fetchTabText()"></textarea>
        <!-- <textarea class="note-area-element" name="note-area-element" id="note-area" cols="30" rows="10"
            @paste="saveTabText()" @keyup="saveTabText()" @mouseup="saveTabText()" :class="tab.active ? '' : 'd-none'"
            v-model="tab.text"></textarea> -->
      </div>

    </div>


  </div>
</template>

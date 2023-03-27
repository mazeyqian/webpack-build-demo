import { loadScript, isSafePWAEnv } from 'mazey';
import { hideHeaderInTOC, hideSidebar } from 'mazey-wordpress-utils';
import { Nav, Style, Container, Address, setLocal } from './previous';

(function (window) {
  setLocal('polestar_version', 'Monday_March_27th_2023');
  window.polestarLoadScript = loadScript;
  window.polestarIsSafePWAEnv = isSafePWAEnv;
  window.hideHeaderInTOC = hideHeaderInTOC;
  window.hideSidebar = hideSidebar;
  // Hide sidebar
  // hideSidebar({
  //   urlContainList: [
  //     'hide_sidebar',
  //     '/2740.html', // Don't fly too low. Be the best version of yourself.
  //   ],
  // });
  // Hide Header when TOC
  // hideHeaderInTOC({
  //   urlContainList: [
  //     '1878.html', // Postman 使用小技巧/指南
  //   ],
  // });
  Nav.addBlank();
  Style.alterSearch();
  Container.hideAdminHeader();
  Container.sortCat();
  Container.diaryIcon();
  Container.visit();
  Address.http2Https();
})(window);

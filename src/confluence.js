/* eslint-disable no-undef */
import { formatDate, getCookie, isNonEmptyArray, genCustomConsole, setImgWidHeiBySrc } from 'mazey';

const ConCon = genCustomConsole('Confluence:');

ConCon.log('loaded');

// Area: `.wiki-content`
const realjQuery = window.jQuery || window.$;
if (realjQuery) {
  const $ = realjQuery;
  // Format
  $('.wiki-content>p>br').hide();
  // Table
  $('.wiki-content td.confluenceTd>a').after('<br />');
  // WP .entry-content td
  $('.entry-content td>a').after('<br />');
  // Record
  let userName, zhUserName;
  const enUserName = getCookie('username') || 'unknown';
  const zhUserNameDom = $('#user-menu-link');
  if (zhUserNameDom.length) {
    zhUserName = zhUserNameDom.attr('title');
  }
  if (zhUserName) {
    userName = `${zhUserName}/${enUserName}`;
  } else {
    userName = enUserName;
  }
  let pageTitle = document.title;
  if (typeof pageTitle === 'string' && pageTitle.length) {
    const titleArr = pageTitle.split('-');
    if (isNonEmptyArray(titleArr)) {
      pageTitle = titleArr[0];
    }
  }
  const settings = {
    url: decodeURIComponent('https%3A%2F%2Fi.mazey.net%2Fserver%2Flog%2Fadd'),
    method: 'POST',
    timeout: 0,
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({
      log_type: 'confluence',
      content: `「${userName}」visited「[${pageTitle}](${location.href})」at「${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}」`,
    }),
  };
  $.ajax(settings).done(function (response) {
    // ConCon.log(response);
  });
  // And then, add CSS/Style to the <img> to make it looks better.
  // Let the ICON looks like a part of the <a> text. The size is similar to the text.
  // And the page has many <a> like this, so we need to use jQuery to do this.
  function addIconToA (selector = '.wiki-content') {
    const aDom = $(`${selector} a`);
    if (aDom.length) {
      aDom.each(function () {
        // It's <a> text content instead of <a> href
        const href = $(this).text();
        if (href.includes('#date-')) {
          // Replace `#date-` with <img>
          $(this).html($(this).html().replace('#date-', '<img src="https://i.mazey.net/uploads/2023/04/date-blue.png" />'));
          // Add CSS/Style to the <img>
          // The ICON looks like a part of the <a> text. The size is similar to the text.
          // The ICON looks higher than the text, Please help me to adjust it.
          $(this).css({
            alignItems: 'center',
            flexWrap: 'wrap',
          });
          const len = '0.8em';
          $(this).find('img').css({
            width: len,
            height: len,
            // verticalAlign: 'middle',
            marginLeft: '0.2em',
            marginRight: '0.1em',
          });
        }
      });
    }
  }
  addIconToA();
  addIconToA('.entry-content');
  setImgWidHeiBySrc();
  $(window).on('load', function () {
    try {
      setImgWidHeiBySrc();
    } catch (err) {
      ConCon.log('setImgWidthHeight error', err);
    }
  });
  // Here's a jQuery script that replaces all text "Br" in a table within the div.entry-content with <br />:
  function replaceBrWithLineBreak (className) {
    if (!$('.' + className).length) {
      // console.log('Error: Element with class name ' + className + ' not found.');
      return;
    }
    // Br or __BR__
    // Previously, I used `Br`
    // Deprecated, Remove it later.
    $('.' + className + ' table td:contains(\'Br\')').each(function () {
      // If it encounters `Browser`, `Break`, `Brave`, `Break`, do not replace it.
      if ($(this).text().match(/(Browser|Break|Brave|Break)/)) return;
      const html = $(this).html().replace(/Br/g, '<br style="display: inline;" />');
      $(this).html(html);
    });
    // Now, I use `__BR__` to replace `Br`
    $('.' + className + ' table td:contains(\'__BR__\')').each(function () {
      const html = $(this).html().replace(/__BR__/g, '<br style="display: inline;" />');
      $(this).html(html);
    });
  }
  replaceBrWithLineBreak('wiki-content');
  replaceBrWithLineBreak('entry-content');
}

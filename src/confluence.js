/* eslint-disable no-undef */
import { formatDate, getCookie, isNonEmptyArray, genCustomConsole } from 'mazey';
import { setImgWidthHeight } from 'mazey-wordpress-utils';

const ConCon = genCustomConsole('Confluence:');

ConCon.log('loaded');

// Area: `.wiki-content`
if (window.$) {
  // Format
  $('.wiki-content>p>br').hide();
  // Table
  $('.wiki-content td.confluenceTd>a').after('<br />');
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
    url: 'https://i.mazey.net/server/log/add',
    method: 'POST',
    timeout: 0,
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      log_type: 'confluence',
      content: `「${userName}」visited「[${pageTitle}](${location.href})」at「${formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')}」`,
    }),
  };
  $.ajax(settings).done(function (response) {
    // ConCon.log(response);
  });
  setImgWidthHeight();
  // ICON: https://blog.mazey.net/wp-content/uploads/2023/04/date-blue.png
  // HTML <a>: <a href="https://example.com">【PC端】游戏中心客服系统升级 #date-2023-04-13</a>
  // Use jQuery to add the icon in the content of the <a>
  // Example: <a href="https://example.com">【PC端】游戏中心客服系统升级 <img src="https://blog.mazey.net/wp-content/uploads/2023/04/date-blue.png">2023-04-13</a>
  // And then, add CSS/Style to the <img> to make it looks better.
  // Let the ICON looks like a part of the <a> text. The size is similar to the text.
  // And the page has many <a> like this, so we need to use jQuery to do this.
  function addIconToA () {
    const aDom = $('.wiki-content a');
    if (aDom.length) {
      aDom.each(function () {
        // const href = $(this).attr('href');
        // It's <a> text content instead of <a> href
        const href = $(this).text();
        if (href.includes('#date-')) {
          // Error
          // $(this).append('<img src="https://blog.mazey.net/wp-content/uploads/2023/04/date-blue.png" />');
          // Replace `#date-` with <img>
          $(this).html($(this).html().replace('#date-', '<img src="https://blog.mazey.net/wp-content/uploads/2023/04/date-blue.png" />'));
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
}

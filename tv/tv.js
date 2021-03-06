define(['loading', './../skininfo', 'alphapicker', './../components/horizontallist', './../cards/cardbuilder', './../components/focushandler', './../components/tabbedpage', 'backdrop', 'focusManager'], function (loading, skinInfo, alphaPicker, horizontalList, cardBuilder, focusHandler, tabbedPage, backdrop, focusManager) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            if (!self.tabbedPage) {
                loading.show();
                renderTabs(view, params.tab, self, params);
            }

            Emby.Page.setTitle('');
        });

        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
            if (self.focusHandler) {
                self.focusHandler.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
            }
        });

        function renderTabs(view, initialTabId, pageInstance, params) {

            self.alphaPicker = new alphaPicker({
                element: view.querySelector('.alphaPicker'),
                itemsContainer: view.querySelector('.contentScrollSlider'),
                itemClass: 'card'
            });

            var tabs = [
            {
                Name: "Series",
                Id: "series"
            }
            ];

            var tabbedPageInstance = new tabbedPage(view, {
                alphaPicker: self.alphaPicker
            });

            tabbedPageInstance.loadViewContent = loadViewContent;
            tabbedPageInstance.params = params;
            tabbedPageInstance.renderTabs(tabs, initialTabId);
            pageInstance.tabbedPage = tabbedPageInstance;

            var viewNames = view.querySelector('.userViewNames');
            viewNames.style.display = "none";
        }

        function loadViewContent(page, id, type) {

            var tabbedPage = this;

            return new Promise(function (resolve, reject) {

                if (self.listController) {
                    self.listController.destroy();
                }
                if (self.focusHandler) {
                    self.focusHandler.destroy();
                }

                var pageParams = tabbedPage.params;

                var autoFocus = false;

                if (!tabbedPage.hasLoaded) {
                    autoFocus = true;
                    tabbedPage.hasLoaded = true;
                }

                renderSeries(page, pageParams, autoFocus, tabbedPage.bodyScroller, resolve);

                page.querySelector('.listNumbers').classList.remove('hide');

                self.alphaPicker.visible(true);
                self.alphaPicker.enabled(true);
            });
        }

        function renderSeries(page, pageParams, autoFocus, scroller, resolve) {

            self.listController = new horizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Series",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                scroller: scroller,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }
    }

});
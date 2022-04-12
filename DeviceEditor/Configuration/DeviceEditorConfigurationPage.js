define(["loading", "dialogHelper", "emby-checkbox", "emby-select", "emby-input"],
    function(loading, dialogHelper) {
        var pluginId = "70CBEBE5-C9E0-4586-AD4A-F5AC84B0AA8C";
        var groupedList;
        var issue;
        
        function openDialog(view) {
              
            var dlg = dialogHelper.createDialog({
                size: "medium-tall",
                removeOnClose: !0,
                scrollY: !1
            });

            dlg.classList.add("formDialog");
            dlg.classList.add("ui-body-a");
            dlg.classList.add("background-theme-a");
            dlg.style = "max-width: 25%; max-height: 70%";

            var html = "";
            html += '<div class="formDialogHeader" style="display:flex">';
            html += '<button is="paper-icon-button-light" class="btnCloseDialog autoSize paper-icon-button-light" tabindex="-1"><i class="md-icon"></i></button><h3 class="formDialogHeaderTitle">Device cleaner settings</h3>';
            html += '</div>';

            html += '<div class="formDialogContent" style="margin:2em; height:35em">';
            html += '<div class="dialogContentInner dialog-content-centered scrollY" style="height:35em;">';

            html += '<div class="inputContainer" style="display: flex; align-items: center;">';
            html += '<div style="flex-grow:1;">';
            html += '<label class="inputLabel" for="threshold">Device count threshold to flag as an issue</label>';
            html += '<input is="emby-input" type="number" id="threshold" name="threshold" min="1" step="1" placeholder="25" />';
            html += '</div>';
            html += '</div>';
            
            html += '<div class="formDialogFooter" style="margin:2em; padding-top:2%;">';
            html += '<button id="saveButton" is="emby-button" type="submit" class="raised button-submit block formDialogFooterItem emby-button">Ok</button>';
            html += '</div>';
            html += '</div>';
            html += '</div>';

            dlg.innerHTML = html;
            dialogHelper.open(dlg);

            ApiClient.getPluginConfiguration(pluginId).then((config) => {
                dlg.querySelector('#threshold').value = config.threshold;
            })

            dlg.querySelector('#saveButton').addEventListener('click',
                () => {

                    var config = {
                        threshold: dlg.querySelector('#threshold').value
                    }
                    ApiClient.updatePluginConfiguration(pluginId, config).then(function (result) {
                        Dashboard.processPluginConfigurationUpdateResult(result);
                    });
                    view.querySelector('#deviceGroups').innerHTML = "";
                    dialogHelper.close(dlg);
                });

            dlg.querySelector('.btnCloseDialog').addEventListener('click',
                () => {
                    dialogHelper.close(dlg);
                });

        }
        function deviceInSession(device) {
            return new Promise(resolve, reject => {
                ApiClient.getJSON(ApiClient.getUrl("Sessions")).then((sessions) => {
                    sessions.forEach(session => {
                        if (device.Id == session.DeviceId) {
                            resolve(true);
                        }
                    });
                    resolve(false);
                });
            });
        }
        function getDeviceTableItemsHtml(device) {
            var html = '';
            
                html += '<tr>';
                html += '<td data-title="Name" class="detailTableBodyCell fileCell">' + device.Name + '</td>';
                html += '<td data-title="Id" class="detailTableBodyCell fileCell">' + device.Id.substring(0, 10);
                + '</td>';
                html += '<td data-title="App" class="detailTableBodyCell fileCell">' + device.AppName + '</td>';
                html += '<td data-title="Version" class="detailTableBodyCell fileCell">' + device.AppVersion + '</td>';
                html += '<td data-title="User" class="detailTableBodyCell fileCell">' + device.LastUserName + '</td>';
                html += '</tr>';
           
            return html;
        }

        function getDeviceGroupsHtml(devices, config) {
          
                var threshold = 25;
                
                    if (config.threshold) {
                        threshold = config.threshold;
                    }
                    var html = '';
                    var i = 0;
                    groupedList = groupBy(devices.Items, device => device.Name);
                    groupedList.forEach(group => {
                        issue = group.length > threshold ? "red" : "green";
                        html += '<div class="paperList">';
                        html += '<h2 style="color:' +
                            issue +
                            '">' +
                            group[0].Name +
                            ': ' +
                            group.length +
                            ' device item(s)</h2>';
                        html += '<div class="scrollY" style="max-height: 30em">';
                        html += '<table class="tblDeviceResults table detailTable" style="width: 100%;">';
                        html += '<thead>';
                        html += '<tr style="text-align: left;">';
                        html += '<th class="detailTableHeaderCell" data-priority="3" style="width: 20%">Name</th>';
                        html += '<th class="detailTableHeaderCell" data-priority="1">Id</th>';
                        html += '<th class="detailTableHeaderCell" data-priority="1" style="width: 10%">App</th>';
                        html += '<th class="detailTableHeaderCell" data-priority="1" style="width: 10%">Version</th>';
                        html += '<th class="detailTableHeaderCell" data-priority="1" style="width: 15%">User</th>';
                        html += '<th class="detailTableHeaderCell" data-priority="1"></th>';
                        html += '</tr>';
                        html += '</thead>';
                        html += '<tbody id="deviceItems"' + i + '>';

                        group.forEach(device => {
                            html += getDeviceTableItemsHtml(device);
                        });
                        html += '</tbody>';
                        html += '</table>';
                        html += '</div >';
                        group.length > threshold
                            ? html += '<button is="emby-button" data-group="' +
                            group[0].Name +
                            '" class="removeGroup raised button-submit block emby-button">Remove redundant enteries</button>'
                            : html += '';
                        html += '</div>';
                        html += '<br />';

                        i++;
                    });

                   return (html);
               
         
        }

        ApiClient.deleteDevice = function(id) {
                var url = ApiClient.getUrl("Devices?Id=" + id);
                return this.ajax({
                    type: "DELETE",
                    url: url
                }); 
        }

        function removeRedundantEnteriesButtonClick(view, config) {
            if (view.querySelector('.removeGroup')) {
                view.querySelectorAll('.removeGroup').forEach(button => {
                    button.addEventListener('click', (e) => {
                        loading.show();
                        removeDeviceItems(groupedList, e, config, view);
                        
                    });
                });
            }
        }

        function removeDeviceItems(groupedList, e, config, view) {
            return new Promise((resolve, reject) => {
                groupedList.forEach(group => {
                    if (group[0].Name !== e.target.dataset.group) return;
                    var i = 0;
                    //Don't kill the session the user is currently in
                    ApiClient.getJSON(ApiClient.getUrl("Sessions")).then((sessions) => {
                        group.forEach(device => {
                            var flagForRemoval = true;
                            sessions.forEach(session => {
                                if (session.DeviceId == device.Id) {
                                    flagForRemoval = false;
                                    return;
                                }
                            });
                            if (flagForRemoval) {
                                ApiClient.deleteDevice(device.Id);
                                console.log('%c' + i + '- Removing device:\n' + device.Id + ' Removed', 'color: red');
                                i++;
                            }
                        });

                        var deviceGroupParentElement = view.querySelector('#deviceGroups');
                        deviceGroupParentElement.innerHTML = "";
                        ApiClient.getJSON(ApiClient.getUrl("Devices")).then((devices) => {
                            deviceGroupParentElement.innerHTML = getDeviceGroupsHtml(devices, config);
                            removeRedundantEnteriesButtonClick(view, config);
                            loading.hide();
                        });

                    });
                    
                });
               
                resolve(true);
            });
        }
        
        function groupBy(list, keyGetter) {
            var map = new Map();
            list.forEach((item) => {
                var key = keyGetter(item);
                var collection = map.get(key);
                if (!collection) {
                    map.set(key, [item]);
                } else {
                    collection.push(item);
                }
            });
            return map;
        }

        function loadDeviceGroups(view, config) {
            return new Promise((resolve, reject) => {
                ApiClient.getJSON(ApiClient.getUrl("Devices")).then((devices) => {
                    var deviceGroupParentElement = view.querySelector('#deviceGroups');
                    deviceGroupParentElement.innerHTML = "";
                    deviceGroupParentElement.innerHTML = getDeviceGroupsHtml(devices, config);
                    removeRedundantEnteriesButtonClick(view, config);
                    loading.hide();
                    resolve(true);
                });
            }); 
        }

        return function(view) {
            view.addEventListener('viewshow',
                () => {

                    view.querySelector('#getDeviceList').addEventListener('click', () => {
                        loading.show();
                        ApiClient.getPluginConfiguration(pluginId).then(config => {
                            loadDeviceGroups(view, config);
                        });
                    });

                    view.querySelector('#settingsDialog').addEventListener('click', () => {
                        openDialog(view);
                    });
                    
                });
        }
    });
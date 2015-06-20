(function(window, angular, undefined) {
    "use strict";
    angular.module("angularLocalStorage", ["ngCookies"]).factory("storage", ["$parse", "$cookieStore", "$window", "$log",
        function($parse, $cookieStore, $window, $log) {
            var storage = typeof $window.localStorage === "undefined" ? undefined : $window.localStorage;
            var supported = typeof storage !== "undefined";
            var watchers = {};
            if (supported) {
                var testKey = "__" + Math.round(Math.random() * 1e7);
                try {
                    localStorage.setItem(testKey, testKey);
                    localStorage.removeItem(testKey)
                } catch (err) {
                    supported = false
                }
            }
            var privateMethods = {
                parseValue: function(res) {
                    var val;
                    try {
                        val = angular.fromJson(res);
                        if (typeof val === "undefined") {
                            val = res
                        }
                        if (val === "true") {
                            val = true
                        }
                        if (val === "false") {
                            val = false
                        }
                        if ($window.parseFloat(val) === val && !angular.isObject(val)) {
                            val = $window.parseFloat(val)
                        }
                    } catch (e) {
                        val = res
                    }
                    return val
                },
                getWatcherId: function(scope, key) {
                    return scope.$id + key
                }
            };
            var publicMethods = {
                set: function(key, value) {
                    if (!supported) {
                        try {
                            $cookieStore.put(key, value);
                            return value
                        } catch (e) {
                            $log.log("Local Storage not supported, make sure you have angular-cookies enabled.")
                        }
                    }
                    var saver = angular.toJson(value);
                    storage.setItem(key, saver);
                    return privateMethods.parseValue(saver)
                },
                get: function(key) {
                    if (!supported) {
                        try {
                            return $cookieStore.get(key)
                        } catch (e) {
                            return null
                        }
                    }
                    var item = storage.getItem(key);
                    return privateMethods.parseValue(item)
                },
                remove: function(key) {
                    if (!supported) {
                        try {
                            $cookieStore.remove(key);
                            return true
                        } catch (e) {
                            return false
                        }
                    }
                    storage.removeItem(key);
                    return true
                },
                bind: function($scope, key, opts) {
                    var watcherId = privateMethods.getWatcherId($scope, key);
                    var defaultOpts = {
                        defaultValue: "",
                        storeName: ""
                    };
                    if (angular.isString(opts)) {
                        opts = angular.extend({}, defaultOpts, {
                            defaultValue: opts
                        })
                    } else {
                        opts = angular.isUndefined(opts) ? defaultOpts : angular.extend(defaultOpts, opts)
                    }
                    var storeName = opts.storeName || key;
                    var scopeVal = $scope.$eval(key);
                    if (publicMethods.get(storeName) === null && typeof scopeVal === "undefined") {
                        publicMethods.set(storeName, opts.defaultValue)
                    }
                    if (typeof scopeVal === "undefined") {
                        $parse(key).assign($scope, publicMethods.get(storeName))
                    }
                    watchers[watcherId] = $scope.$watch(key, function(val) {
                        if (angular.isDefined(val)) {
                            publicMethods.set(storeName, val)
                        }
                    }, true);
                    return publicMethods.get(storeName)
                },
                unbind: function($scope, key, storeName) {
                    var watcherId = privateMethods.getWatcherId($scope, key);
                    storeName = storeName || key;
                    $parse(key).assign($scope, null);
                    publicMethods.remove(storeName);
                    if (watchers[watcherId]) {
                        watchers[watcherId]();
                        delete watchers[watcherId]
                    }
                },
                clearAll: function() {
                    storage.clear()
                },
                isCookieFallbackActive: function() {
                    return !supported
                },
                getKeys: function() {
                    var keys = [];
                    if (!supported) {
                        var cookieArr = document.cookie.split(";");
                        for (var cnt = 0, cntLen = cookieArr.length; cnt < cntLen; ++cnt) {
                            keys.push(cookieArr[cnt].split("=")[0].trim())
                        }
                    } else {
                        for (var i = 0, len = localStorage.length; i < len; ++i) {
                            keys.push(localStorage.key(i))
                        }
                    }
                    return keys
                }
            };
            return publicMethods
        }
    ])
})(window, window.angular);
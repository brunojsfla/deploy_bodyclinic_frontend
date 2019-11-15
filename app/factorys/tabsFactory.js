(function(){
    app.factory('tabsFactory', [function(){
        
        function showTabs (obj, {
            tabList = false,
            tabCreate = false,
            tabUpdate = false,
            tabDelete = false, 
            tabView = false
        }){
            obj.tabList = tabList;
            obj.tabCreate = tabCreate;
            obj.tabUpdate = tabUpdate;
            obj.tabDelete = tabDelete;
            obj.tabView = tabView;
        };

        return { showTabs };
    }]);
})();
function $FilterProvider($provide) {

  this.register = function(name, factory) {
    if (_.isObject(name)) {
      return _.map(name, function(factory, name) {
        return this.register(name, factory);
      }, this);
    } else {
      return $provide.factory(name + 'Filter', factory);
    }
  };

  this.$get = ['$injector', function($injector) {
    return function filter(name) {
      return $injector.get(name + 'Filter');
    };
  }];

  this.register('filter', filterFilter);

}
$FilterProvider.$inject = ['$provide'];

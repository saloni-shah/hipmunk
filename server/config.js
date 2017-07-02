var config = {
  expedia_url: 'http://localhost:9000/scrapers/Expedia',
  orbitz_url: 'http://localhost:9000/scrapers/Orbitz',
  priceline_url: 'http://localhost:9000/scrapers/Priceline',
  travelocity_url: 'http://localhost:9000/scrapers/Travelocity',
  hilton_url: 'http://localhost:9000/scrapers/Hilton',
  provider_url: function() {
    return [this.expedia_url, this.orbitz_url, this.priceline_url, this.travelocity_url, this.hilton_url];
  }
}

module.exports.appConfig = config;
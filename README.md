# cordova-plugin-dz-settingspage

// preload

this.game.load.text("settingsXml", "settings.xml");

// init

this.game.state.add("Settings", SettingsPage);

// click event

this.game.state.start("Settings", true, false, {
  xml_key: "settingsXml"
});

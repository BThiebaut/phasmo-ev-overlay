var Evidences = function(){
  var _self = this;
  
  this.evidences = {
    emf    : 1,
    spirit : 2,
    writing: 4,
    orb    : 8,
    finger : 16,
    temp   : 32,
    dots   : 64,
  };
  
  
  this.entities = {
    banshee    : _self.evidences.finger | _self.evidences.orb | _self.evidences.dots,
    demon      : _self.evidences.finger | _self.evidences.writing | _self.evidences.temp,
    goryo      : _self.evidences.emf | _self.evidences.finger | _self.evidences.dots,
    hantu      : _self.evidences.finger | _self.evidences.orb | _self.evidences.temp,
    jinn       : _self.evidences.emf | _self.evidences.finger | _self.evidences.temp,
    mare       : _self.evidences.spirit | _self.evidences.orb | _self.evidences.writing,
    myling     : _self.evidences.emf | _self.evidences.finger | _self.evidences.writing,
    oni        : _self.evidences.emf | _self.evidences.temp | _self.evidences.dots,
    phantom    : _self.evidences.spirit | _self.evidences.finger | _self.evidences.dots,
    poltergeist: _self.evidences.spirit | _self.evidences.finger | _self.evidences.writing,
    revenant   : _self.evidences.orb | _self.evidences.writing | _self.evidences.temp,
    shade      : _self.evidences.emf | _self.evidences.writing | _self.evidences.temp,
    spirit     : _self.evidences.emf | _self.evidences.spirit | _self.evidences.writing,
    wraith     : _self.evidences.emf | _self.evidences.spirit | _self.evidences.dots,
    yokai      : _self.evidences.spirit | _self.evidences.orb | _self.evidences.dots,
    yurei      : _self.evidences.orb | _self.evidences.temp | _self.evidences.dots,
  };
  
  this.langs = {
    banshee    : "Banshee",
    demon      : "Demon",
    goryo      : "Goryo",
    hantu      : "Hantu",
    jinn       : "Djinn",
    mare       : "Cauchemar",
    myling     : "Myling",
    oni        : "Oni",
    phantom    : "Fantôme",
    poltergeist: "Poltergeist",
    revenant   : "Revenant",
    shade      : "Ombre",
    spirit     : "Esprit",
    wraith     : "Spectre",
    yokai      : "Yokai",
    yurei      : "Yurei",
  };
  
  this.game = {
    name           : '',
    map            : '',
    evidences      : 0,
    excludes       : 0,
    ouija          : false,
    bone           : false,
    possEntities   : [],
    impossEvidences: [],
    possBits       : 0
  };

  this._and = (bit1, bit2) => {
    return (bit1 & bit2) == bit2;
  }
  
  this._not = (bit1, bit2) => {
    return (bit1 & bit2) != bit2;
  }

  this._notExclude = (bit) => {
    return _self._bitCount(_self.game.excludes) == 0 || _self._not(bit, _self.game.excludes);
  }

  this._bitCount = (n) => {
    n = n - ((n >> 1) & 0x55555555)
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
    return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
  };
  

  this._calculateEntities = () => {
    let listEntities = [];
    for(let entityName in _self.entities){
      let bitsEntity = _self.entities[entityName];
      if (_self._bitCount(_self.game.evidences) == 0 || ( _self._and(bitsEntity, _self.game.evidences ) )) {
        listEntities.push(entityName);
      }
    }

    for (let entityIdx in listEntities){
      let entityName = listEntities[entityIdx];
      let bitsEntity = _self.entities[entityName];
      if (_self._bitCount(_self.game.excludes) > 0 && ( _self._and(bitsEntity, _self.game.excludes ) )) {
        listEntities.splice(entityIdx, 1);
      }
    }
    _self.game.possEntities = listEntities;
  };
  
  this._calculateEvidences = () => {
    let listEvidences = [];
    _self.game.possBits = 0;
    for(let evidenceName in _self.evidences){
      let ev = _self.evidences[evidenceName];
  
      for(let i in _self.game.possEntities){
        let entityName = _self.game.possEntities[i];
        if (listEvidences.indexOf(evidenceName) < 0 && _self._and(_self.entities[entityName], ev)){
          listEvidences.push(evidenceName);
          _self.game.possBits |= ev;
        }
      }
    }
  
    _self.game.possEvidences = listEvidences;
  };
  
  this.drawEntityList = () => {
    let el = document.getElementById('entity-list');
    if (_self._bitCount(_self.game.evidences) > 0){
      let html = '';
      for(let i in _self.game.possEntities){
        let entityName = _self.game.possEntities[i];
        html += '<span class="entity">'+ _self.langs[entityName] +'</span> - ';
      }
      html = html.substr(0, html.length - 3);
      el.innerHTML = html;
    }else {
      el.innerHTML = "";
    }
  };

  
  this.reset = () => {
    _self.game = {
      name         : '',
      map          : '',
      evidences    : 0,
      ouija        : false,
      bone         : false,
      possEntities : [],
      possEvidences: [],
    }
    _self.draw();
  };
  
  this.toggleEvidence = (bit) => {
    if (_self._bitCount(_self.game.evidences) < 3 || _self._and(_self.game.evidences, bit)){
      _self.game.evidences ^= bit;
      if ( _self._and(_self.game.excludes, bit) ){
        _self.game.excludes ^= bit;
      }
    }
  };
  
  this.toggleExclude = (bit) => {
    if ( (_self.game.evidences & bit) != bit ){
      _self.game.excludes ^= bit;
    }
  };
  
  
  this.isPossibleSwitch = (bit) => {
    return _self._bitCount(_self.game.evidences) == 0 || _self._and(_self.game.possBits, bit);
  };

  this.draw = () => {
    _self._calculateEntities();
    _self._calculateEvidences();
  
    for (let evidenceName in _self.evidences){
      let evidenceBits = _self.evidences[evidenceName];
      let el = document.getElementById(evidenceName + '-svg');
      if (_self.game.possEvidences.indexOf(evidenceName) > -1){
        el.classList.remove('impossible');
      }else {
        el.classList.add('impossible');
      }
  
      if ( _self._and(_self.game.evidences, evidenceBits) ){
        el.classList.add('active');
      }else {
        el.classList.remove('active');
      }

      if (_self._and(_self.game.excludes, evidenceBits)){
        el.classList.add('excluded');
      }else {
        el.classList.remove('excluded');
      }
    }
  
    _self.drawEntityList();
  };

}

window.Evidences = Evidences;
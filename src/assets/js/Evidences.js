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
    obake      : _self.evidences.emf | _self.evidences.finger | _self.evidences.orb,
    onryo      : _self.evidences.spirit | _self.evidences.orb | _self.evidences.temp,
    raiju      : _self.evidences.emf | _self.evidences.orb | _self.evidences.dots,
    twins      : _self.evidences.emf | _self.evidences.spirit | _self.evidences.temp,
    mimic      : _self.evidences.spirit | _self.evidences.finger | _self.evidences.temp
  };
  
  this.entitieslangs = {
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
    obake      : "Obake",
    onryo      : "Onryo",
    raiju      : "Raiju",
    twins      : "Les jumeaux",
    mimic      : "Mimic"
  };

  this.evidenceslangs = {
    emf        : "emf",
    spirit     : "spirit",
    writing    : "écriture",
    orb        : "orbe",
    finger     : "empreinte",
    temp       : "température",
    dots       : "dots",
  }
  
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
  
  this.drawEntityList = (possEvidencesList) => {
    let el = document.getElementById('entity-list');
    if (_self._bitCount(_self.game.evidences) > 0 || _self._bitCount(_self.game.excludes) > 0){
      let html = '';
      for(let i in _self.game.possEntities){
        let entityName = _self.game.possEntities[i];
        let evName = '';
        if (_self._bitCount(_self.game.evidences) == 2){
          for(let evidence of possEvidencesList){
            if (_self._and(_self.entities[entityName], _self.evidences[evidence])){
              evName = ' (' + _self.evidenceslangs[evidence] + ')';
              break;
            }
          }
        }
        let dist = evName == '' ? 4 : 2;
        let sep = i > 0 && i % dist == 0 ? '<br/>' : ' - ';

        let idx = parseInt(i) + 1;
        if (idx == _self.game.possEntities.length){
          sep = '';
        }

        html += '<span class="entity">'+ _self.entitieslangs[entityName] + evName + '</span>'+ sep;
      }
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
    if ( _self._not(_self.game.evidences, bit) ){
      _self.game.excludes ^= bit;
    }
  };
  
  
  this.isPossibleSwitch = (bit) => {
    return _self._bitCount(_self.game.evidences) == 0 || _self._and(_self.game.possBits, bit);
  };

  this.draw = () => {
    _self._calculateEntities();
    _self._calculateEvidences();
    let possEvidencesList = [];

    for (let evidenceName in _self.evidences){
      let evidenceBits = _self.evidences[evidenceName];
      let el = document.getElementById(evidenceName + '-svg');
      let poss, active, exclu = false;
      
      if (_self.game.possEvidences.indexOf(evidenceName) > -1){
        el.classList.remove('impossible');
        poss = true;
      }else {
        el.classList.add('impossible');
      }
  
      if ( _self._and(_self.game.evidences, evidenceBits) ){
        el.classList.add('active');
        active = true;
      }else {
        el.classList.remove('active');
      }

      if (_self._and(_self.game.excludes, evidenceBits)){
        el.classList.add('excluded');
        exclu = true;
      }else {
        el.classList.remove('excluded');
      }

      if (poss && !active && !exclu){
        possEvidencesList.push(evidenceName);
      }
    }

    _self.drawEntityList(possEvidencesList);
  };

}

window.Evidences = Evidences;
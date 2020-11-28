/**
 * Carga archivos desde la máquina cliente con API File
 */
class Lector {

    leerArchivoAudio(files) {
        this.archivo = files[0];
        //Solamente admite archivos de tipo texto
        var tipoTexto = /text.*/;
        if (this.archivo.type.match(tipoTexto)) {
            this.cargaContenido();
        }
        else {
            var error = document.createElement("p");
            error.innerText="El contenido de este archivo no se puede traducir debido a su formato";
            document.getElementById("drop_zone").after(error);
        }
        //this.cargaContenido();
    }

    cargaContenido() {
        var lector = new FileReader();
        lector.onload = function (evento) {
            traductor = new Traductor(lector.result);
            traductor.traducir();
        }
        lector.readAsText(this.archivo);
        
    }

}

/**
 * Mapea cada caracter de texto con su correspondiente representación
 * en código morse
 */
class Traductor {

    constructor(texto) {
        this.texto = texto; //TODO añadir números
        this.letras = 'abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ .,?:-!"1234567890';
        /*this.morse = new Array(
            ".- ", "-... ", "-.-. ", "-.. ", ". ", "..-. ",
            "-. ", ".... ", ".. ", ".- ", "-.- ", ".-.. ",
            "- ", "-. ", "-.- ", "- ", ".-. ", "-.- ", ".-. ",
            "... ", "- ", "..- ", "...- ", ".- ", "-..- ",
            "-.- ", "-.. ", ".- ", "-... ", "-.-. ", "-.. ", ". ", "..-. ", "-. ", ".... ", ".. ", ".- ",
            "-.- ", ".-.. ", "- ", "-. ", "-.- ", "- ", ".-. ",
            "-.- ", ".-. ", "... ", "- ", "..- ", "...- ",
            ".- ", "-..- ", "-.- ", "-.. ", " / ", ".-.-.- ",
            "-..- ", "..-.. ", "-... ", "-....- ", "!");*/
        this.morse = new Array(
            '.- ', '-... ', '-.-. ', '-.. ', '. ', '..-. ', '--. ', '.... ',
            '.. ', '.--- ', '-.- ', '.-.. ', '-- ', '-. ', '--.-- ', '--- ', '.--. ',
            '--.- ', '.-. ', '... ', '- ', '..- ', '...- ', '.-- ', '-..- ',
            '-.-- ', '--.. ', '.- ', '-... ', '-.-. ', '-.. ', '. ', '..-. ', '--. ', '.... ',
            '.. ', '.--- ', '-.- ', '.-.. ', '-- ', '-. ', '--.-- ', '--- ', '.--. ',
            '--.- ', '.-. ', '... ', '- ', '..- ', '...- ', '.-- ', '-..- ',
            '-.-- ', '--.. ', ' / ', '.-.-.- ', '--..-- ', '..--.. ', '---... ', '-....- ', '! ', '.-..-. ',
            '.---- ', '..--- ', '...-- ', '....- ', '..... ', '-.... ', '--... ', '---.. ', '----. ','----- ' );

    }

    traducir() {

        var resultado = "";
        var charOriginal;
        for (var count = 0; count < this.texto.length; count++) {
            charOriginal = this.texto.charAt(count);
            for (var i = 0; i < this.letras.length; i++) {
                if (charOriginal == this.letras.charAt(i)) {
                    resultado += this.morse[i];
                    break;
                }
            }
        }
        document.getElementById("original").value = this.texto;
        document.getElementById("traduccion").value = resultado;
        morse = new Morse(resultado);
    }
}

//MORSE
/**
 * Utiliza la API Web Audio para reproducir
 * señales de audio que simulan código morse
 */
class Morse {

    constructor(texto) {
        if (this.audioContext === undefined) {
            this.crearContexto();
        }
        this.texto = texto;
    }

    /**
     * Inicializa el contexto de audio y crea un objeto
     * Oscilador que genera un tono (onda periódica)
     */
    crearContexto() {
        this.audioContext = new AudioContext(); //Creamos objeto contexto de audio
        this.tono = this.audioContext.createOscillator(); //Creamos objeto oscilador
        this.ganancia = this.audioContext.createGain(); //Creamos objeto ganancia
        this.ganancia.gain.value = 0; //Ganancia inicial de 0 hasta que sea modificada
        this.tono.frequency.value = 750; 
        this.tono.connect(this.ganancia); //Conectamos el objeto ganancia al objeto oscilador
        this.ganancia.connect(this.audioContext.destination); //Conectamos el output a la ganancia
        this.duracion = 1.2 / 15;
        this.tono.start(0); //Iniciamos el oscilador en este momento (tiempo=0), pero será inaudible porque la ganancia es 0 
    }


    reproducir() {
        var array = this.texto.split("");
        var tiempo = this.audioContext.currentTime;
        array.forEach(function (letra) {

            switch (letra) {

                case '.':

                    this.subirGanacia(tiempo);
                    navigator.vibrate(this.duracion); // API Vibration
                    this.bajarGanacia(tiempo+= this.duracion); //Baja ganancia transcurrida la duración
                    tiempo += this.duracion;
                    break;

                case '-':

                    this.subirGanacia(tiempo); //Sube la ganancia ahora
                    tiempo += 3 * this.duracion; //Tres veces la duración del punto
                    navigator.vibrate(3*this.duracion);
                    this.bajarGanacia(tiempo) //Baja la ganancia transcurrida esa duración de raya
                    tiempo += this.duracion; //Resetea 'tiempo' a la duración del punto
                    break;

                case " ":

                    tiempo += 7 * this.duracion;
                    break;
            }
        }.bind(this));

        return false;
    }

    subirGanacia(momento) {
        this.ganancia.gain.setValueAtTime(1, momento); //Audible (ganancia=1) en el momento especificado
    }

    bajarGanacia(momento) {
        this.ganancia.gain.setValueAtTime(0, momento);
    }

}

/**
 * Funcionalidad para aceptar archivos arrastrados a la página en lugar
 * de cargarlos mediante el explorador de archivos
 */
class DragDropManager {
    dropHandler(ev) {
        ev.preventDefault(); //Evita el comportamiendo por defecto

        if (ev.dataTransfer.items) {
            // Usar la interfaz DataTransferItemList para acceder a el/los archivos)
            for (var i = 0; i < ev.dataTransfer.items.length; i++) {
                // Si los elementos arrastrados no son ficheros, rechazarlos
                if (ev.dataTransfer.items[i].kind === 'file') {
                    var file = ev.dataTransfer.items[i].getAsFile();
                    console.log('... file[' + i + '].name = ' + file.name);
                    //document.getElementById("drop_zone").placeholder = file.name;
                    lector.leerArchivoAudio(ev.dataTransfer.files);
                }
            }
        } 

        // Pasar el evento a removeDragData para limpiar
        this.removeDragData(ev)
    }

    dragOverHandler(ev) {

        ev.preventDefault();
    }

    removeDragData(ev) {

        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to remove the drag data
            ev.dataTransfer.items.clear();
        } else {
            // Use DataTransfer interface to remove the drag data
            ev.dataTransfer.clearData();
        }
    }
}

var lector = new Lector();
var audio;
var morse;
var traductor;
var dragDropManager = new DragDropManager();


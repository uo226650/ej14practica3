/**
 * Aplicación para convertir textos a código morse en formato textual y auditivo
 * 
 * Hace uso de la API FILE para cargar archivos de texto desde la máquina del cliente
 * Así mismo ofrece la opción de arrastrar los archivos que desean ser cargados
 * mediante la API DRAG and DROP.
 * 
 * El código morse se reproduce en formato de audio gracias a la configuración
 * de un oscilador a través de la API Web Audio
 * 
 */


/**
 * Carga archivos desde la máquina cliente con API File
 */
class Lector {

    leerArchivo(files) {
        this.archivo = files[0];
        //Solamente admite archivos de tipo texto
        var tipoTexto = /text.*/;
        if (this.archivo.type.match(tipoTexto)) {
            this.cargaContenido();
            document.getElementById("drop_zone").placeholder = this.archivo.name;
            
            //Elimina el mensaje de error creado con anterioridad si existiera
            if (document.getElementsByTagName("span").length != 0){
                document.getElementsByTagName("span")[0].parentNode.removeChild(document.getElementsByTagName("span")[0]); //Elimina el elemento del DOM por completo
            }
        }
        else {
            //Crea un elemento para mostrar el mensaje de error
            var error = document.createElement("span");
            error.innerText="El contenido de este archivo no se puede traducir debido a su formato";
            document.getElementById("drop_zone").after(error);
            
            //Limpia el placeholder en caso de que tenga el nombre del archivo anteriormente cargado
            document.getElementById("drop_zone").placeholder = "Arrastra y suelta un archivo de texto a esta zona ...";
        }
    }

    /**
     * Envía los datos leídos a un objeto traductor para su procesado
     */
    cargaContenido() {
        var lector = new FileReader();
        lector.onload = function (evento) {
            traductor = new Traductor(lector.result);
            traductor.traducir();
        }
        lector.readAsText(this.archivo);    
    }

    /**
     * Pide al traductor la traducción directa del area de texto editable por el usuario
     * Accionado por el botón "Traducir"
     */
    traducirInput(){
        var texto = document.getElementById("original").value;
        traductor = new Traductor(texto);
        traductor.traducir();
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

    /**
     * Presenta el texto original y la traducción en las respectivas
     * areas de texto una vez ha procesado el cálculo de la traducción.
     * Crea un objeto Morse al cual le pasa el resultado del texto codificado en morse
     */
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
        this.texto = texto;
    }

    /**
     * Inicializa el contexto de audio y crea un objeto
     * Oscilador que genera un tono (onda periódica)
     */
    crearContexto() {
        var AudioContext = window.AudioContext || window.webkitAudioContext; //Para que lo soporte Safari
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
        this.crearContexto();
        var array = this.texto.split("");
        var tiempo = this.audioContext.currentTime;
        array.forEach(function (letra) {

            switch (letra) {

                case '.':

                    this.subirGanacia(tiempo);
                    
                    //Extensión futura sincronizando vibraciones largas y cortas
                    //en dispositivos compatibles con la API Vibration

                    /*if (window.navigator && window.navigator.vibrate) {
                        navigator.vibrate(80); // API Vibration
                     } else {
                        alert("Vibración no soportada");
                     }*/
                    
                    this.bajarGanacia(tiempo+= this.duracion); //Baja ganancia transcurrida la duración
                    tiempo += this.duracion;
                    break;

                case '-':

                    this.subirGanacia(tiempo); //Sube la ganancia ahora
                    tiempo += 3 * this.duracion; //Tres veces la duración del punto
                    /*navigator.vibrate(240);*/
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

    parar(){
        this.tono.stop(this.audioContext.currentTime);
    }

}

/**
 * Funcionalidad para aceptar archivos arrastrados a la página en lugar
 * de cargarlos mediante el explorador de archivos
 * 
 * Carga archivos desde la máquina cliente usando la API Drag and Drop
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
                    lector.leerArchivo(ev.dataTransfer.files);
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


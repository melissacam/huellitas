import { FormControl, FormGroup } from '@angular/forms';
import {
  MENSAJES,
  aplicarErroresServidor,
  descripcionValida,
  mensajeDeError,
  nombreValido,
} from './validadores';

const validarNombre = (valor: unknown) => nombreValido(new FormControl(valor));
const validarDescripcion = (valor: unknown) => descripcionValida(new FormControl(valor));

describe('nombreValido', () => {
  it('marca como obligatorio el nombre vacío o solo con espacios', () => {
    expect(validarNombre('')).toEqual({ obligatorio: true });
    expect(validarNombre('   ')).toEqual({ obligatorio: true });
    expect(validarNombre(null)).toEqual({ obligatorio: true });
  });

  it('rechaza nombres de menos de 2 o más de 40 caracteres', () => {
    expect(validarNombre('a')).toEqual({ longitud: true });
    expect(validarNombre('a'.repeat(41))).toEqual({ longitud: true });
  });

  it('acepta nombres de 2 a 40 caracteres', () => {
    expect(validarNombre('ab')).toBeNull();
    expect(validarNombre('a'.repeat(40))).toBeNull();
  });

  it('no cuenta los espacios al inicio ni al final', () => {
    expect(validarNombre('  Luna  ')).toBeNull();
    expect(validarNombre(' a ')).toEqual({ longitud: true });
    expect(validarNombre(`  ${'a'.repeat(40)}  `)).toBeNull();
  });
});

describe('descripcionValida', () => {
  it('acepta la descripción vacía o ausente', () => {
    expect(validarDescripcion('')).toBeNull();
    expect(validarDescripcion(null)).toBeNull();
  });

  it('acepta hasta 200 caracteres y rechaza 201', () => {
    expect(validarDescripcion('a'.repeat(200))).toBeNull();
    expect(validarDescripcion('a'.repeat(201))).toEqual({ longitud: true });
  });

  it('no cuenta los espacios al inicio ni al final', () => {
    expect(validarDescripcion(`   ${'a'.repeat(200)}   `)).toBeNull();
  });
});

describe('MENSAJES', () => {
  it('coincide con los textos de la especificación', () => {
    expect(MENSAJES).toEqual({
      nombreObligatorio: 'El nombre es obligatorio',
      nombreLongitud: 'El nombre debe tener entre 2 y 40 caracteres',
      especie: 'La especie debe ser perro, gato u otro',
      edad: 'La edad debe ser un número entero entre 0 y 30',
      estado: 'El estado debe ser disponible o adoptado',
      descripcion: 'La descripción no puede superar los 200 caracteres',
    });
  });
});

describe('mensajeDeError', () => {
  it('no devuelve nada si no hay errores', () => {
    expect(mensajeDeError('nombre', null)).toBeNull();
  });

  it('distingue el nombre obligatorio de la longitud', () => {
    expect(mensajeDeError('nombre', { obligatorio: true })).toBe(MENSAJES.nombreObligatorio);
    expect(mensajeDeError('nombre', { longitud: true })).toBe(MENSAJES.nombreLongitud);
  });

  it('usa un único mensaje para cualquier error de edad', () => {
    expect(mensajeDeError('edad', { required: true })).toBe(MENSAJES.edad);
    expect(mensajeDeError('edad', { min: { min: 0, actual: -1 } })).toBe(MENSAJES.edad);
    expect(mensajeDeError('edad', { pattern: true })).toBe(MENSAJES.edad);
  });

  it('prioriza el mensaje del servidor', () => {
    expect(mensajeDeError('especie', { servidor: 'Mensaje de la API' })).toBe('Mensaje de la API');
  });
});

describe('aplicarErroresServidor', () => {
  const crearFormulario = () =>
    new FormGroup({ nombre: new FormControl('Luna'), edad: new FormControl(2) });

  it('marca cada campo con el mensaje del servidor', () => {
    const formulario = crearFormulario();
    const aplicados = aplicarErroresServidor(formulario, {
      edad: MENSAJES.edad,
      campoDesconocido: 'Se ignora',
    });
    expect(aplicados).toBe(true);
    expect(formulario.controls.edad.errors).toEqual({ servidor: MENSAJES.edad });
    expect(formulario.controls.edad.touched).toBe(true);
    expect(formulario.controls.nombre.errors).toBeNull();
  });

  it('no hace nada si la respuesta no trae errores por campo', () => {
    const formulario = crearFormulario();
    expect(aplicarErroresServidor(formulario, undefined)).toBe(false);
    expect(aplicarErroresServidor(formulario, { otro: 'x' })).toBe(false);
    expect(formulario.valid).toBe(true);
  });

  it('el error del servidor desaparece al editar el campo', () => {
    const formulario = crearFormulario();
    aplicarErroresServidor(formulario, { nombre: 'Nombre repetido' });
    formulario.controls.nombre.setValue('Lunita');
    expect(formulario.controls.nombre.errors).toBeNull();
  });
});

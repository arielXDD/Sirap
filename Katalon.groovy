import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

// ============================================================
//  SIRAP — TC12: Asistencias - Eliminar registro (solo Admin)
// ============================================================
// --- Login Admin ---
WebUI.openBrowser('')

WebUI.navigateToUrl('http://localhost:3000/')

WebUI.maximizeWindow(FailureHandling.STOP_ON_FAILURE)

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/svg'))

WebUI.setText(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/input_Usuario_username'), 
    'admin')

WebUI.setEncryptedText(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/input_Contrasea_password'), 
    'hUKwJTbofgPU9eVlw/CnDQ==')

WebUI.sendKeys(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/input_Contrasea_password'), 
    Keys.chord(Keys.ENTER))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Empleados'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Ver Detalle'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Editar'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Guardar Cambios'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Nuevo Empleado'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Cancelar'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Usuarios'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Administrador'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Supervisor'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Empleado'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Activo'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Inactivo'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Usuario'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Nombre'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Todos'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Recientes'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Todos_1'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Tarjetas NFC'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Asignar Tarjeta'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Cancelar_1'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Desactivar'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Activar'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_Asistencias'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Detalles'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Editar_1'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Guardar Cambios_1'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Registro de Asistencias_btn btn-outline'))

WebUI.selectOptionByValue(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/select_Todos los estadosPuntualRetardoFalta_e63cb0'), 
    'puntual', true)

WebUI.selectOptionByValue(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/select_Todos los estadosPuntualRetardoFalta_e63cb0'), 
    'retardo', true)

WebUI.selectOptionByValue(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/select_Todos los estadosPuntualRetardoFalta_e63cb0'), 
    'falta', true)

WebUI.selectOptionByValue(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/select_Todos los estadosPuntualRetardoFalta_e63cb0'), 
    'justificada', true)

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Reportes'))

WebUI.selectOptionByValue(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/select_Reporte DiarioReporte SemanalReporte_d085a7'), 
    'semanal', true)

WebUI.selectOptionByValue(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/select_Reporte DiarioReporte SemanalReporte_d085a7'), 
    'mensual', true)

WebUI.selectOptionByValue(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/select_Todos los empleadosAdmin Root (EMP-0_760ee3'), 
    '1', true)

WebUI.selectOptionByValue(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/select_Todos los empleadosAdmin Root (EMP-0_760ee3'), 
    '6', true)

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Horarios'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_EMP-001  Sistemas'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/div_DOM'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/div_SAB'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Guardar cambios (1)'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_Juan Prez'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_Ana Lpez'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_EMP-004  TI'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_EMP-005  Logstica'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_PRUEBA UNO'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_EMP-001  Sistemas'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/div_Admin RootEMP-001  Sistemas'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/h3_Admin Root'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Editar informacin'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Guardar Cambios'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Das Festivos'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Agregar Festivo'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Cancelar_1_2'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/main_Calendario de Das Festivos Agregar Fes_fb38e7'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Gestin de Ausencias'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Mis Solicitudes'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Todas'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/main_Gestin de AusenciasMis SolicitudesToda_10a666'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Mis Solicitudes'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Todas'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Respaldos'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Generar Respaldo'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/svg_1'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/div_Sistema de AsistenciaAdmin Rootadminist_864f84'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/span_Recuperacin BD'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/main_Recuperacin de Base de DatosRestaura l_4acee7'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Respaldos'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Gestin de Ausencias'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Das Festivos'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Horarios'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Reportes'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Asistencias'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Tarjetas NFC'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Usuarios'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Empleados'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Panel de Control'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Cerrar Sesin'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Olvidaste tu contrasea'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Enviar Correo de Recuperacin'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/div_Volver al inicio de sesin'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/button_Volver al inicio de sesin'))

WebUI.click(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/a_Volver al registro de asistencia'))

WebUI.setText(findTestObject('Object Repository/SIRAP/Page_SIRAP - Sistema Integral de Registro d_d91864/input_Bienvenido_nfc-key-reader'), 
    '123456789')

WebUI.closeBrowser()


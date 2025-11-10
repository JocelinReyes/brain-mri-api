from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from django.http import JsonResponse
from django.db.models import Count, Q  # Q ya está importado correctamente
import pandas as pd
from datetime import datetime
from .models import Patient, MRIImage
from .serializers import PatientSerializer, MRIImageSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('id')  # ✅ AGREGAR ordenamiento aquí
    serializer_class = PatientSerializer
    
    def get_queryset(self):
        queryset = Patient.objects.all().order_by('id')  # ✅ Y también aquí
        return queryset.annotate(
            image_count=Count('images'),
            mask_count=Count('images', filter=Q(images__mask=1))
        )
    
    @action(detail=True, methods=['get'])
    def images(self, request, pk=None):
        patient = self.get_object()
        images = patient.images.all()
        serializer = MRIImageSerializer(images, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_patients = Patient.objects.count()
        total_images = MRIImage.objects.count()
        images_with_mask = MRIImage.objects.filter(mask=1).count()
        images_without_mask = MRIImage.objects.filter(mask=0).count()
        
        return Response({
            'total_patients': total_patients,
            'total_images': total_images,
            'images_with_mask': images_with_mask,
            'images_without_mask': images_without_mask,
            'mask_percentage': round((images_with_mask / total_images * 100), 2) if total_images > 0 else 0
        })

class MRIImageViewSet(viewsets.ModelViewSet):
    queryset = MRIImage.objects.all().order_by('id')  # ✅ Ordenamiento para MRIImage
    serializer_class = MRIImageSerializer
    
    def get_queryset(self):
        queryset = MRIImage.objects.all().order_by('id')
        patient_id = self.request.query_params.get('patient_id')
        mask = self.request.query_params.get('mask')
        
        if patient_id:
            queryset = queryset.filter(patient__patient_id=patient_id)
        if mask:
            queryset = queryset.filter(mask=int(mask))
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def mask_stats(self, request):
        mask_0 = MRIImage.objects.filter(mask=0).count()
        mask_1 = MRIImage.objects.filter(mask=1).count()
        
        return Response({
            'mask_0': mask_0,
            'mask_1': mask_1
        })

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_csv(request):
    """Endpoint para subir archivo CSV desde la interfaz web"""
    try:
        if 'csv_file' not in request.FILES:
            return JsonResponse({'error': 'No se encontró archivo CSV'}, status=400)
        
        csv_file = request.FILES['csv_file']
        
        # Verificar que sea un archivo CSV
        if not csv_file.name.endswith('.csv'):
            return JsonResponse({'error': 'El archivo debe ser CSV'}, status=400)
        
        # Leer el archivo CSV
        df = pd.read_csv(csv_file)
        
        patients_processed = set()
        images_count = 0
        
        for index, row in df.iterrows():
            patient_id = row['patient_id']
            
            # Obtener o crear paciente
            patient, created = Patient.objects.get_or_create(
                patient_id=patient_id
            )
            patients_processed.add(patient_id)
            
            # Crear imagen si no existe
            MRIImage.objects.get_or_create(
                patient=patient,
                image_path=row['image_path'],
                mask_path=row['mask_path'],
                mask=int(row['mask'])
            )
            
            images_count += 1
        
        # Estadísticas finales
        total_patients = Patient.objects.count()
        total_images = MRIImage.objects.count()
        images_with_mask = MRIImage.objects.filter(mask=1).count()
        
        return JsonResponse({
            'success': True,
            'message': 'Datos cargados exitosamente',
            'stats': {
                'patients_processed': len(patients_processed),
                'images_loaded': images_count,
                'total_patients': total_patients,
                'total_images': total_images,
                'images_with_mask': images_with_mask
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'Error procesando archivo: {str(e)}'}, status=500)
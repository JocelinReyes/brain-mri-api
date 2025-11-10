from rest_framework import serializers
from .models import Patient, MRIImage

class MRIImageSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    
    class Meta:
        model = MRIImage
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    image_count = serializers.IntegerField(read_only=True)
    mask_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Patient
        fields = '__all__'